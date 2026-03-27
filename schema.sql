-- Criação do schema inicial da plataforma Imóvel Forte

-- 1. Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  phone text,
  role text check (role in ('admin', 'seller', 'lead')) default 'lead',
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
CREATE POLICY "Apenas admin e o próprio anunciante podem inserir imóveis" ON public.properties FOR INSERT WITH CHECK (auth.uid() = seller_id or (select role from public.profiles where id = auth.uid()) = 'admin');
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
