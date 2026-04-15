
create or replace function update_property_and_profile(
    p_property_id uuid,
    p_seller_id uuid,
    p_title text,
    p_description text,
    p_price numeric,
    p_intent text,
    p_condition text,
    p_category text,
    p_subcategory text,
    p_address_city text,
    p_address_state text,
    p_specs jsonb,
    p_main_image text,
    p_gallery text[],
    p_is_luxury boolean,
    p_full_name text,
    p_phone text,
    p_user_role text,
    p_is_professional boolean,
    p_service_category text,
    p_service_type text
)
returns void as $$
begin
    -- Inicia a transação
    -- Atualiza a tabela de imóveis (properties)
    update public.properties
    set
        title = p_title,
        description = p_description,
        price = p_price,
        intent = p_intent,
        condition = p_condition,
        category = p_category,
        subcategory = p_subcategory,
        address_city = p_address_city,
        address_state = p_address_state,
        specs = p_specs,
        main_image = p_main_image,
        gallery = p_gallery,
        is_luxury = p_is_luxury
    where id = p_property_id and seller_id = p_seller_id;

    -- Atualiza a tabela de perfis (profiles)
    update public.profiles
    set
        full_name = p_full_name,
        phone = p_phone,
        user_role = p_user_role,
        is_professional = p_is_professional,
        service_category = p_service_category,
        service_type = p_service_type
    where id = p_seller_id;

    -- Comita a transação se tudo ocorrer bem
exception
    when others then
        -- Rola para trás a transação em caso de erro
        raise;
end;
$$ language plpgsql;
