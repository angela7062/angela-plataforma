-- 1) Status nos anuncios
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';

-- Forca default padrao para novos registros
ALTER TABLE public.properties
ALTER COLUMN status SET DEFAULT 'ativo';

-- Garante valor inicial para registros antigos
UPDATE public.properties
SET status = 'ativo'
WHERE status IS NULL;

-- Converte legado "cadastrado" para "ativo"
UPDATE public.properties
SET status = 'ativo'
WHERE status = 'cadastrado';

-- 2) Creditos disponiveis no perfil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS creditos_disponiveis INTEGER DEFAULT 0;

-- 3) Indice para consultas por status
CREATE INDEX IF NOT EXISTS idx_properties_status
ON public.properties(status);

-- 4) RLS ativo para properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 5) Politica para dono do anuncio atualizar o proprio status
DROP POLICY IF EXISTS "Apenas o anunciante pode atualizar o status do proprio imovel" ON public.properties;

CREATE POLICY "Apenas o anunciante pode atualizar o status do proprio imovel"
ON public.properties
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);
