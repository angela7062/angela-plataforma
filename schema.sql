-- Criação do schema inicial da plataforma Imóvel Forte

-- 1. Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  phone text,
  role text check (role in ('admin', 'seller', 'lead')) default 'lead',
  user_role text check (user_role in ('Comprador', 'Anunciante', 'Ambos')) default 'Comprador',
  is_professional boolean default false,
  service_category text check (service_category in ('Vendas', 'Projetos', 'Construção', 'Manutenção')),
  service_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar RLS nos perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis são visíveis por todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Tabela de Imóveis
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) not null,
  slug text unique not null,
  title text not null,
  description text,
  price numeric,
  intent text check (intent in ('Vender', 'Alugar', 'Temporada', 'Leilão')),
  condition text check (condition in ('Novo', 'Usado')),
  category text check (category in ('Casas', 'Apartamentos', 'Rurais & Lotes', 'Comercial', 'Lançamentos')),
  subcategory text,
  address_city text,
  address_state text,
  specs jsonb default '{}'::jsonb,
  main_image text,
  gallery text[] default '{}',
  is_luxury boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Imóveis são visíveis para todos" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Apenas anunciantes podem inserir imóveis" ON public.properties FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_role IN ('Anunciante', 'Ambos')
  )
);
CREATE POLICY "Apenas admin e o próprio anunciante podem atualizar imóveis" ON public.properties FOR UPDATE USING (auth.uid() = seller_id or (select role from public.profiles where id = auth.uid()) = 'admin');

-- 3. Tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) not null,
  lead_id uuid references public.profiles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendedores veem seus leads" ON public.leads FOR SELECT USING (auth.uid() = seller_id or (select role from public.profiles where id = auth.uid()) = 'admin');
CREATE POLICY "Leads podem criar registros" ON public.leads FOR INSERT WITH CHECK (auth.uid() = lead_id);


-- Trigger para criar perfil automaticamente após cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para validar subcategorias de imóveis
CREATE OR REPLACE FUNCTION public.validate_property_subcategory()
RETURNS trigger AS $$
BEGIN
  IF NEW.category = 'Casas' AND NEW.subcategory NOT IN ('CASA TÉRREA', 'TÉRREA GEMINADA', 'TÉRREA EM CONDOMÍNIO', 'SOBRADO', 'SOBRADO GEMINADO', 'SOBRADO EM CONDOMÍNIO', 'CASA SOBREPOSTA', 'SOBREPOSTA EM CONDOMÍNIO') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Casas: %', NEW.subcategory;
  ELSIF NEW.category = 'Apartamentos' AND UPPER(NEW.subcategory) NOT IN ('EM GERAL', 'KITNETS / FLATS / STUDIOS', 'COBERTURA DUPLEX', 'NA PLANTA') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Apartamentos: %', NEW.subcategory;
  ELSIF NEW.category = 'Rurais & Lotes' AND UPPER(NEW.subcategory) NOT IN ('SÍTIOS E CHÁCARAS', 'LOTES E TERRENOS', 'FAZENDAS') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Rurais & Lotes: %', NEW.subcategory;
  ELSIF NEW.category = 'Comercial' AND UPPER(NEW.subcategory) NOT IN ('SALAS COMERCIAIS', 'PRÉDIOS INTEIROS', 'GALPÕES', 'LOJAS') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Comercial: %', NEW.subcategory;
  ELSIF NEW.category = 'Lançamentos' AND UPPER(NEW.subcategory) NOT IN ('NA PLANTA', 'EM OBRAS', 'PRONTO PARA MORAR', 'OPORTUNIDADES') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Lançamentos: %', NEW.subcategory;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_subcategory ON public.properties;
CREATE TRIGGER trigger_validate_subcategory
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE PROCEDURE public.validate_property_subcategory();

-- Trigger para validar tipos de serviço de profissionais
CREATE OR REPLACE FUNCTION public.validate_profile_service_type()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_professional = false THEN
    RETURN NEW;
  END IF;

  IF NEW.service_category = 'Vendas' AND NEW.service_type NOT IN ('Corretores de Imóveis', 'Imobiliárias Cadastradas', 'Agências') THEN
    RAISE EXCEPTION 'Tipo de serviço inválido para Vendas: %', NEW.service_type;
  ELSIF NEW.service_category = 'Projetos' AND NEW.service_type NOT IN ('Arquitetos', 'Engenheiros') THEN
    RAISE EXCEPTION 'Tipo de serviço inválido para Projetos: %', NEW.service_type;
  ELSIF NEW.service_category = 'Construção' AND NEW.service_type NOT IN ('Construtores') THEN
    RAISE EXCEPTION 'Tipo de serviço inválido para Construção: %', NEW.service_type;
  ELSIF NEW.service_category = 'Manutenção' AND NEW.service_type NOT IN ('Pedreiros', 'Pintores', 'Encanadores', 'Eletricistas', 'Todos') THEN
    RAISE EXCEPTION 'Tipo de serviço inválido para Manutenção: %', NEW.service_type;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_service_type ON public.profiles;
CREATE TRIGGER trigger_validate_service_type
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.validate_profile_service_type();
