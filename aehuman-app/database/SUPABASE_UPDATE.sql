-- =====================================================
-- AGGIORNAMENTO TABELLA PROFILES
-- Aggiungi i campi age e location
-- =====================================================

-- Aggiungi colonna age (età) se non esiste
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Aggiungi colonna location (città/località) se non esiste
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location TEXT;

-- Aggiungi constraint per age (deve essere ragionevole)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'age_range'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT age_range CHECK (age IS NULL OR (age >= 13 AND age <= 120));
  END IF;
END $$;

-- Verifica che i campi siano stati aggiunti
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;
