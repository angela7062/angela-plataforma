-- Migration: Remove all ENUM-like CHECK constraints from properties and profiles
-- Reason: Move validation logic to the application layer (Zod) for flexibility.

DO $$
DECLARE
    constraint_name_var text;
BEGIN
    -- 
    -- Drop constraints from the 'properties' table
    -- 

    -- 1. Drop constraint for 'status' column
    SELECT constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints
    WHERE table_name = 'properties' AND constraint_name LIKE 'properties_status_check%';
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.properties DROP CONSTRAINT ' || quote_ident(constraint_name_var);
        RAISE NOTICE 'Dropped constraint: % from properties', constraint_name_var;
    END IF;

    -- 2. Drop constraint for 'intent' column
    SELECT constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints
    WHERE table_name = 'properties' AND constraint_name LIKE 'properties_intent_check%';
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.properties DROP CONSTRAINT ' || quote_ident(constraint_name_var);
        RAISE NOTICE 'Dropped constraint: % from properties', constraint_name_var;
    END IF;

    -- 3. Drop constraint for 'condition' column
    SELECT constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints
    WHERE table_name = 'properties' AND constraint_name LIKE 'properties_condition_check%';
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.properties DROP CONSTRAINT ' || quote_ident(constraint_name_var);
        RAISE NOTICE 'Dropped constraint: % from properties', constraint_name_var;
    END IF;

    -- 4. Drop constraint for 'category' column
    SELECT constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints
    WHERE table_name = 'properties' AND constraint_name LIKE 'properties_category_check%';
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.properties DROP CONSTRAINT ' || quote_ident(constraint_name_var);
        RAISE NOTICE 'Dropped constraint: % from properties', constraint_name_var;
    END IF;

    -- 5. Drop constraint for 'subcategory' column
    SELECT constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints
    WHERE table_name = 'properties' AND constraint_name LIKE 'properties_subcategory_check%';
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.properties DROP CONSTRAINT ' || quote_ident(constraint_name_var);
        RAISE NOTICE 'Dropped constraint: % from properties', constraint_name_var;
    END IF;

    -- 
    -- Drop constraints from the 'profiles' table
    -- 

    -- 6. Drop constraint for 'user_role' column
    SELECT constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name LIKE 'profiles_user_role_check%';
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || quote_ident(constraint_name_var);
        RAISE NOTICE 'Dropped constraint: % from profiles', constraint_name_var;
    END IF;

END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN public.properties.status IS 'Status managed by application logic. No DB constraints.';
COMMENT ON COLUMN public.properties.intent IS 'Intent managed by application logic. No DB constraints.';
COMMENT ON COLUMN public.properties.condition IS 'Condition managed by application logic. No DB constraints.';
COMMENT ON COLUMN public.properties.category IS 'Category managed by application logic. No DB constraints.';
COMMENT ON COLUMN public.properties.subcategory IS 'Subcategory managed by application logic. No DB constraints.';
COMMENT ON COLUMN public.profiles.user_role IS 'User role managed by application logic. No DB constraints.';
