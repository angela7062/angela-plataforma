-- 1. Modificar a tabela public.profiles para adicionar a coluna user_role
-- Adiciona a coluna com o valor padrão 'Comprador' conforme as últimas especificações
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_role text 
CHECK (user_role IN ('Comprador', 'Anunciante', 'Ambos')) 
DEFAULT 'Comprador';

-- Atualizar usuários existentes para o padrão 'Comprador'
UPDATE public.profiles 
SET user_role = 'Comprador' 
WHERE user_role IS NULL;

-- 2. Configurar RLS na tabela public.properties (tabela de imóveis)
-- Habilitar RLS (caso não esteja habilitada)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Imóveis são visíveis para todos" ON public.properties;
DROP POLICY IF EXISTS "Imóveis são visíveis para usuários autenticados" ON public.properties;
DROP POLICY IF EXISTS "Apenas anunciantes podem inserir imóveis" ON public.properties;
DROP POLICY IF EXISTS "Apenas admin e o próprio anunciante podem inserir imóveis" ON public.properties;
DROP POLICY IF EXISTS "Leitura permitida para todos os usuários autenticados" ON public.properties;
DROP POLICY IF EXISTS "Inserção permitida apenas para anunciantes" ON public.properties;

-- Criar política de leitura (SELECT) pública: "todos possam visualizar"
CREATE POLICY "Imóveis são visíveis para todos" 
ON public.properties FOR SELECT 
USING (true);

-- Criar política de inserção (INSERT) apenas para 'Anunciante' ou 'Ambos'
CREATE POLICY "Apenas anunciantes podem inserir imóveis" 
ON public.properties FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_role IN ('Anunciante', 'Ambos')
  )
);

COMMENT ON COLUMN public.profiles.user_role IS 'Tipo de usuário na plataforma: Comprador, Anunciante ou Ambos';
