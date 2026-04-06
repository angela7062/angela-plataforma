-- Script Mestre: Arquitetura de Dados Imóvel Forte
-- Baseado no Prompt Mestre para Engenharia de Dados e Soluções Supabase

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ATUALIZAÇÃO DA TABELA DE PERFIS (PROFILES)
-- Integração com auth.users e diferenciação de papéis
DO $$ 
BEGIN
    -- Adicionar user_role se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_role') THEN
        ALTER TABLE public.profiles ADD COLUMN user_role text CHECK (user_role IN ('Vendedor', 'Comprador', 'Ambos')) DEFAULT 'Comprador';
    ELSE
        -- Atualizar check constraint para usar os termos do prompt
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_role_check;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_role_check CHECK (user_role IN ('Vendedor', 'Comprador', 'Ambos', 'Anunciante'));
    END IF;

    -- Adicionar slug para Cartões de Visita Digitais
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'slug') THEN
        ALTER TABLE public.profiles ADD COLUMN slug text UNIQUE;
    END IF;

    -- Adicionar branding_data para personalização do perfil/cartão
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'branding_data') THEN
        ALTER TABLE public.profiles ADD COLUMN branding_data jsonb DEFAULT '{}'::jsonb;
    END IF;

    -- Adicionar phone_number para contato direto (99) 99999-9999
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_number text;
    END IF;
END $$;

-- 3. ATUALIZAÇÃO DA TABELA DE IMÓVEIS (PROPERTIES)
-- Foco em escalabilidade e filtragem dinâmica
DO $$ 
BEGIN
    -- Renomear specs para features se specs existir, ou criar features
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'specs') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'features') THEN
        ALTER TABLE public.properties RENAME COLUMN specs TO features;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'features') THEN
        ALTER TABLE public.properties ADD COLUMN features jsonb DEFAULT '{}'::jsonb;
    END IF;

    -- Campos para Automação de Marketing e SEO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'meta_tags') THEN
        ALTER TABLE public.properties ADD COLUMN meta_tags jsonb DEFAULT '{}'::jsonb;
    END IF;

    -- Campos de Performance (Range Filters)
    -- Já existem em database.ts, mas garantimos no banco
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'area_total') THEN
        ALTER TABLE public.properties ADD COLUMN area_total numeric;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'vagas') THEN
        ALTER TABLE public.properties ADD COLUMN vagas integer DEFAULT 0;
    END IF;

    -- Status e Integridade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status') THEN
        ALTER TABLE public.properties ADD COLUMN status text DEFAULT 'Rascunho' CHECK (status IN ('Ativo', 'Inativo', 'Rascunho', 'Vendido', 'Alugado'));
    ELSE
        -- Garantir os termos 'Ativo' e 'Inativo'
        ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
        -- Mantemos 'cadastrado' por compatibilidade se existir
        ALTER TABLE public.properties ADD CONSTRAINT properties_status_check CHECK (status IN ('Ativo', 'Inativo', 'Rascunho', 'Vendido', 'Alugado', 'cadastrado'));
    END IF;
END $$;

-- 4. ÍNDICES DE PERFORMANCE
-- B-Tree para buscas exatas e ordenação
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_intent ON public.properties(intent);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area_total);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);

-- GIN para buscas em JSONB (features e meta_tags)
CREATE INDEX IF NOT EXISTS idx_properties_features ON public.properties USING GIN (features);
CREATE INDEX IF NOT EXISTS idx_properties_meta_tags ON public.properties USING GIN (meta_tags);

-- 5. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Remover políticas para evitar conflitos
DROP POLICY IF EXISTS "Leitura pública de imóveis ativos" ON public.properties;
DROP POLICY IF EXISTS "Proprietários podem gerenciar seus imóveis" ON public.properties;
DROP POLICY IF EXISTS "Imóveis são visíveis para todos" ON public.properties;
DROP POLICY IF EXISTS "Apenas anunciantes podem inserir imóveis" ON public.properties;

-- Qualquer usuário (público) tem permissão de leitura para imóveis com status 'Ativo'
CREATE POLICY "Leitura pública de imóveis ativos" 
ON public.properties FOR SELECT 
USING (status = 'Ativo' OR status = 'cadastrado' OR auth.uid() = seller_id);

-- Apenas o proprietário autenticado pode Criar/Editar/Excluir seus próprios imóveis
CREATE POLICY "Proprietários podem gerenciar seus imóveis" 
ON public.properties FOR ALL 
TO authenticated 
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- 6. SQL DE ESTUDO: BUSCA DINÂMICA (Exemplo de Query)
/*
SELECT *
FROM public.properties
WHERE 
    (status = 'Ativo') AND
    (intent = :intent OR :intent IS NULL) AND
    (category = :category OR :category IS NULL) AND
    (price BETWEEN :min_price AND :max_price OR (:min_price IS NULL AND :max_price IS NULL)) AND
    (area_total >= :min_area OR :min_area IS NULL) AND
    (vagas >= :min_vagas OR :min_vagas IS NULL) AND
    (features @> :features_filter OR :features_filter IS NULL)
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
*/

-- 7. COMENTÁRIOS DE ARQUITETURA
COMMENT ON TABLE public.properties IS 'Tabela principal de imóveis com suporte a filtros dinâmicos e SEO.';
COMMENT ON COLUMN public.properties.features IS 'Atributos flexíveis via JSONB para escalabilidade sem alteração de schema.';
COMMENT ON COLUMN public.profiles.user_role IS 'Papel do usuário: Vendedor, Comprador ou Ambos.';
