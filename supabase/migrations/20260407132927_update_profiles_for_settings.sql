ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "number" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS complement TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, role, entity_type, phone, country, street, "number", complement, neighborhood, city, state, zip_code, bank, agency, account, document
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'contractor'),
    COALESCE(NEW.raw_user_meta_data->>'entityType', 'pf'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'country', 'BR'),
    NEW.raw_user_meta_data->>'street',
    NEW.raw_user_meta_data->>'number',
    NEW.raw_user_meta_data->>'complement',
    NEW.raw_user_meta_data->>'neighborhood',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'zipCode',
    NEW.raw_user_meta_data->>'bank',
    NEW.raw_user_meta_data->>'agency',
    NEW.raw_user_meta_data->>'account',
    NEW.raw_user_meta_data->>'document'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
