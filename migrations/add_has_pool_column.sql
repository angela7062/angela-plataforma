-- Adiciona a coluna has_pool à tabela properties
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS has_pool BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.properties.has_pool IS 'Indica se a propriedade tem piscina.';