-- Adiciona a coluna logradouro_sigla à tabela properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS logradouro_sigla TEXT;

-- Script para atualizar os registros existentes (opcional)
-- UPDATE public.properties SET logradouro_sigla = 
--   CASE features->>'logradouro_tipo'
--     WHEN 'Alameda' THEN 'AL'
--     WHEN 'Avenida' THEN 'AV'
--     WHEN 'Balneário' THEN 'BAL'
--     WHEN 'Estrada' THEN 'EST'
--     WHEN 'Fazenda' THEN 'FAZ'
--     WHEN 'Ladeira' THEN 'LAD'
--     WHEN 'Loteamento' THEN 'LOT'
--     WHEN 'Rodovia' THEN 'ROD'
--     WHEN 'Rua' THEN 'R'
--     WHEN 'Travessa' THEN 'TV'
--     WHEN 'Viela' THEN 'VLA'
--     ELSE NULL
--   END;
