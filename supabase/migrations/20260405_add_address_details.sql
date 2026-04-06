-- Adiciona colunas para o endereço detalhado na tabela properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS street_name TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS street_number TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS condo_name TEXT;

-- Opcional: Atualizar registros existentes com base nos dados do JSON de features
-- UPDATE public.properties SET 
--     street_name = features->>'street_name',
--     street_number = features->>'street_number',
--     condo_name = features->>'condo_name'
-- WHERE features->>'street_name' IS NOT NULL 
--    OR features->>'street_number' IS NOT NULL 
--    OR features->>'condo_name' IS NOT NULL;
