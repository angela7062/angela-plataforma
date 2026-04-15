
-- File: supabase/migrations/YYYYMMDDHHMMSS_add_email_sync_trigger.sql
-- Note: This trigger is for demonstration purposes and is NOT required for your current schema.
-- It should only be used if you were to add an 'email' column to the 'public.profiles' table.

-- 1. Create the trigger function
-- This function runs with the security level of the user who defined it.
-- It copies the new, confirmed email from 'auth.users' to 'public.profiles'.
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the email was updated and is different from the old one.
  -- Supabase Auth only updates the email in auth.users AFTER the user has verified it.
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Create the trigger
-- This trigger will execute the function 'handle_auth_user_update'
-- after any update operation on the 'auth.users' table.
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_auth_user_update();

