-- Executar no SQL Editor do Supabase (ou via CLI) se a coluna ainda não existir.
-- Listagem pública usa apenas imóveis com status = 'cadastrado'.

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS status text DEFAULT 'cadastrado';

UPDATE public.properties
SET status = 'cadastrado'
WHERE status IS NULL;

COMMENT ON COLUMN public.properties.status IS 'Fluxo editorial: ex. cadastrado, pendente, rascunho';
