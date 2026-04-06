-- Adiciona a coluna logradouro à tabela properties para armazenar o nome por extenso
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS logradouro TEXT;

-- Opcional: Atualizar registros existentes com base no logradouro_tipo que está dentro da coluna features
-- UPDATE public.properties SET logradouro = features->>'logradouro_tipo'
-- WHERE features->>'logradouro_tipo' IS NOT NULL;

-- Garante que a coluna logradouro_sigla também exista
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS logradouro_sigla TEXT;
