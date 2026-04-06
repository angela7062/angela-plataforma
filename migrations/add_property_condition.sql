-- Adiciona a coluna condition à tabela properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS condition text 
CHECK (condition IN ('Novo', 'Usado'));

-- Atualiza registros existentes se necessário (exemplo: mapeia casa_nova boolean para condition)
UPDATE public.properties 
SET condition = CASE 
  WHEN (specs->>'casa_nova')::boolean = true THEN 'Novo' 
  ELSE 'Usado' 
END 
WHERE condition IS NULL AND specs->>'casa_nova' IS NOT NULL;

COMMENT ON COLUMN public.properties.condition IS 'Condição do imóvel: Novo ou Usado';
