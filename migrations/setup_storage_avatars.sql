-- SCRIPT DE CONFIGURAÇÃO DE STORAGE E PERFIS (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase para corrigir o erro de upload.

-- 1. GARANTIR COLUNA avatar_url NA TABELA PROFILES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
END $$;

-- 2. CRIAR BUCKET 'avatars' SE NÃO EXISTIR
-- O bucket precisa existir no storage.buckets para aceitar uploads.
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- 3. POLÍTICAS DE SEGURANÇA PARA O STORAGE (RLS)
-- Removemos políticas antigas para evitar duplicidade
DROP POLICY IF EXISTS "Avatars são públicos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem subir avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatares" ON storage.objects;

-- Permite que qualquer pessoa (logada ou não) veja as fotos de perfil
CREATE POLICY "Avatars são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permite que usuários autenticados subam arquivos para sua própria pasta 'identidade/'
CREATE POLICY "Usuários autenticados podem subir avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = 'identidade' AND 
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Permite que usuários atualizem seus próprios arquivos
CREATE POLICY "Usuários podem atualizar seus próprios avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = 'identidade' AND 
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Permite que usuários deletem seus próprios arquivos
CREATE POLICY "Usuários podem deletar seus próprios avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = 'identidade' AND 
    (storage.foldername(name))[2] = auth.uid()::text
);
