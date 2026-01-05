-- Migration: Aggiungi campi age e location a profiles
-- Data: 2026-01-05
-- Descrizione: Aggiunge campi opzionali per età e località degli utenti

-- Aggiungi colonna age (età)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Aggiungi colonna location (città/località)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location TEXT;

-- Aggiungi constraint per age (deve essere ragionevole)
ALTER TABLE public.profiles
ADD CONSTRAINT age_range CHECK (age IS NULL OR (age >= 13 AND age <= 120));

-- Commenti per documentazione
COMMENT ON COLUMN public.profiles.age IS 'Età dell''utente (opzionale, 13-120 anni)';
COMMENT ON COLUMN public.profiles.location IS 'Città o località dell''utente (opzionale)';
