-- Atualiza a regra de validação para incluir 'Leilão'
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_intent_check;

ALTER TABLE public.properties ADD CONSTRAINT properties_intent_check 
CHECK (intent IN ('Vender', 'Alugar', 'Temporada', 'Leilão'));

COMMENT ON COLUMN public.properties.intent IS 'Termos oficiais: Vender, Alugar, Temporada e Leilão';
