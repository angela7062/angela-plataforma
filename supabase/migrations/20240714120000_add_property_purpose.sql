
-- Migration: Adiciona a coluna \'purpose\' para finalidade do negócio na tabela \'properties\'
-- Timestamp: 2024-07-14 12:00:00

BEGIN;

-- 1. Cria o tipo ENUM \'property_purpose\' se ele ainda não existir.
-- Este tipo define as opções válidas para a finalidade de um imóvel.
-- O valor \'Selecione...\' é incluído para ser o padrão e garantir retrocompatibilidade.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = \'property_purpose\') THEN
        CREATE TYPE public.property_purpose AS ENUM (
            \'Selecione...\',
            \'Vender\',
            \'Alugar\',
            \'Temporada\',
            \'Leilão\'
        );
    END IF;
END$$;

-- 2. Adiciona a coluna \'purpose\' à tabela \'public.properties\' se ela não existir.
-- A coluna utilizará o tipo \'property_purpose\' e terá um valor padrão NOT NULL
-- para evitar problemas com registros existentes.
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS purpose public.property_purpose NOT NULL DEFAULT \'Selecione...\';

-- 3. Comentário sobre Row Level Security (RLS)
-- A adição desta coluna não afeta políticas de RLS existentes que não especificam
-- colunas. Se suas políticas de INSERT ou UPDATE são restritivas a nível de coluna,
-- você precisará incluir a nova coluna \'purpose\' nelas.

COMMIT;
