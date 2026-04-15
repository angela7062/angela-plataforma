-- Arquivo de Migração: Remoção Definitiva de Todas as Validações de Schema
-- Objetivo: Centralizar 100% da lógica de validação na aplicação (Server Actions com Zod).

-- 1. Remoção de CONSTRAINTS de verificação da tabela `properties`
-- Estas constraints limitam os valores de texto que podem ser inseridos, causando falhas.
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_intent_check;
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_condition_check;
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_category_check;
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check; -- Crucial

-- 2. Remoção de CONSTRAINTS de verificação da tabela `profiles`
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_service_category_check;

-- 3. Remoção de TRIGGERS de validação que causam falhas silenciosas
-- Triggers são mais perigosos, pois sua falha pode não ser claramente reportada.
DROP TRIGGER IF EXISTS trigger_validate_subcategory ON public.properties;
DROP FUNCTION IF EXISTS public.validate_property_subcategory();

DROP TRIGGER IF EXISTS trigger_validate_service_type ON public.profiles;
DROP FUNCTION IF EXISTS public.validate_profile_service_type();

-- 4. Conversão de colunas baseadas em ENUM para TEXT
-- Isso evita erros de "invalid input value for enum" e dá flexibilidade total à aplicação.
ALTER TABLE public.properties ALTER COLUMN status TYPE text;
ALTER TABLE public.properties ALTER COLUMN intent TYPE text;
ALTER TABLE public.properties ALTER COLUMN condition TYPE text;
ALTER TABLE public.properties ALTER COLUMN category TYPE text;
ALTER TABLE public.properties ALTER COLUMN subcategory TYPE text;

ALTER TABLE public.profiles ALTER COLUMN user_role TYPE text;
ALTER TABLE public.profiles ALTER COLUMN service_category TYPE text;

-- 5. Limpeza dos tipos ENUM que não são mais necessários
-- O CASCADE garante que quaisquer dependências remanescentes sejam removidas.
DROP TYPE IF EXISTS property_status CASCADE;
DROP TYPE IF EXISTS property_intent CASCADE;
DROP TYPE IF EXISTS property_condition CASCADE;
DROP TYPE IF EXISTS property_category CASCADE;
DROP TYPE IF EXISTS property_subcategory CASCADE;
DROP TYPE IF EXISTS profile_role CASCADE;
DROP TYPE IF EXISTS service_category_enum CASCADE;

