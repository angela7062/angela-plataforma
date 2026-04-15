-- MIGRATION: Corrige a função `update_property_and_profile` para lidar com a coluna `purpose`.
-- TIMESTAMP: 2024-07-14 14:00:00

BEGIN;

CREATE OR REPLACE FUNCTION public.update_property_and_profile(
    p_property_id uuid,
    p_property_data jsonb,
    p_profile_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Permite que a função execute com os privilégios de quem a criou
AS $$
DECLARE
    v_seller_id uuid;
    v_property_purpose public.property_purpose;
    v_gallery_urls text[];
BEGIN
    -- 1. Obter o seller_id para segurança e para saber qual perfil de usuário atualizar.
    SELECT seller_id INTO v_seller_id FROM public.properties WHERE id = p_property_id;

    IF v_seller_id IS NULL THEN
        RAISE EXCEPTION 'Imóvel com ID % não encontrado.', p_property_id;
    END IF;

    -- 2. **A GRANDE MUDANÇA**
    -- Extrai o valor de 'purpose' do JSON e faz o "cast" para o tipo ENUM `property_purpose`.
    v_property_purpose := (p_property_data->>'purpose')::public.property_purpose;

    -- Trata o caso onde o usuário pode ter salvo "Selecione...", o que não é um valor válido.
    -- Nesse caso, mantemos o valor existente na coluna (COALESCE).
    IF v_property_purpose = 'Selecione...' THEN
        v_property_purpose := NULL; -- Define como NULL para que o COALESCE funcione
    END IF;

    -- 3. Atualiza a tabela 'properties'
    -- Usamos COALESCE: se o novo valor for nulo (não enviado no JSON), mantém o valor antigo.
    UPDATE public.properties
    SET
        title           = COALESCE(p_property_data->>'title', title),
        description     = COALESCE(p_property_data->>'description', description),
        price           = COALESCE((p_property_data->>'price')::numeric, price),
        -- ... outros campos ...
        purpose         = COALESCE(v_property_purpose, purpose) -- ATUALIZAÇÃO DO CAMPO `purpose`
    WHERE id = p_property_id;

    -- 4. Atualiza a tabela 'profiles' (lógica inalterada)
    IF p_profile_data IS NOT NULL AND jsonb_pretty(p_profile_data) != '{}' THEN
        UPDATE public.profiles
        SET
            full_name         = COALESCE(p_profile_data->>'full_name', full_name),
            phone             = COALESCE(p_profile_data->>'phone', phone),
            user_role         = COALESCE(p_profile_data->>'user_role', user_role)
        WHERE id = v_seller_id;
    END IF;
END;
$$;

COMMIT;
