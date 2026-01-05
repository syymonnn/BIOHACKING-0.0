-- =====================================================
-- Æ-HUMAN TRACK DATABASE SCHEMA
-- Supabase SQL Schema per Health Space Tracking
-- =====================================================

-- Abilita l'estensione UUID (se non già abilitata)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELLA PROFILI UTENTE
-- Estende auth.users con dati personalizzati
-- =====================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  age INTEGER,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TABELLA PROTOCOLLI
-- Protocolli di benessere creati dagli utenti
-- =====================================================
CREATE TABLE public.protocols (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_protocols_updated_at 
  BEFORE UPDATE ON public.protocols 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. TABELLA ABITUDINI
-- Abitudini che compongono i protocolli
-- =====================================================
CREATE TYPE habit_type AS ENUM ('core', 'optional');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');

CREATE TABLE public.habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  protocol_id UUID REFERENCES public.protocols(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type habit_type DEFAULT 'optional',
  frequency habit_frequency DEFAULT 'daily',
  target_value INTEGER DEFAULT 1, -- Per abitudini quantitative (es: 8 bicchieri d'acqua)
  unit TEXT, -- Unità di misura (es: "bicchieri", "minuti", "km")
  icon TEXT, -- Emoji o nome icona
  color TEXT DEFAULT '#00FFD1', -- Colore per UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_habits_updated_at 
  BEFORE UPDATE ON public.habits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indice per performance
CREATE INDEX idx_habits_protocol_id ON public.habits(protocol_id);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);

-- =====================================================
-- 4. TABELLA TRACKING ABITUDINI
-- Tracciamento giornaliero delle abitudini
-- =====================================================
CREATE TABLE public.habit_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  value INTEGER, -- Valore effettivo (es: 7 bicchieri invece di 8)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(habit_id, date) -- Un solo record per abitudine per giorno
);

CREATE TRIGGER update_habit_tracking_updated_at 
  BEFORE UPDATE ON public.habit_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indici per performance
CREATE INDEX idx_habit_tracking_habit_id ON public.habit_tracking(habit_id);
CREATE INDEX idx_habit_tracking_user_id ON public.habit_tracking(user_id);
CREATE INDEX idx_habit_tracking_date ON public.habit_tracking(date);
CREATE INDEX idx_habit_tracking_user_date ON public.habit_tracking(user_id, date);

-- =====================================================
-- 5. TABELLA INSIGHTS
-- Insight settimanali e mensili generati automaticamente
-- =====================================================
CREATE TYPE insight_type AS ENUM ('weekly', 'monthly', 'custom');

CREATE TABLE public.insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type insight_type NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  consistency_score NUMERIC(5,2), -- Percentuale 0-100
  total_habits INTEGER,
  completed_days INTEGER,
  streak_current INTEGER,
  streak_best INTEGER,
  top_habits JSONB, -- Array di abitudini migliori
  struggling_habits JSONB, -- Array di abitudini con difficoltà
  summary TEXT, -- Testo generato automaticamente
  recommendations JSONB, -- Suggerimenti personalizzati
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indici per performance
CREATE INDEX idx_insights_user_id ON public.insights(user_id);
CREATE INDEX idx_insights_period ON public.insights(period_start, period_end);

-- =====================================================
-- 6. TABELLA GOALS (Obiettivi)
-- Obiettivi a lungo termine dell'utente
-- =====================================================
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'archived');

CREATE TABLE public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status goal_status DEFAULT 'active',
  progress NUMERIC(5,2) DEFAULT 0, -- Percentuale 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TRIGGER update_goals_updated_at 
  BEFORE UPDATE ON public.goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Sicurezza a livello di riga: ogni utente vede solo i suoi dati
-- =====================================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- POLICIES PER PROFILES
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- POLICIES PER PROTOCOLS
CREATE POLICY "Users can view own protocols" 
  ON public.protocols FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own protocols" 
  ON public.protocols FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own protocols" 
  ON public.protocols FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own protocols" 
  ON public.protocols FOR DELETE 
  USING (auth.uid() = user_id);

-- POLICIES PER HABITS
CREATE POLICY "Users can view own habits" 
  ON public.habits FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own habits" 
  ON public.habits FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" 
  ON public.habits FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" 
  ON public.habits FOR DELETE 
  USING (auth.uid() = user_id);

-- POLICIES PER HABIT_TRACKING
CREATE POLICY "Users can view own tracking" 
  ON public.habit_tracking FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tracking" 
  ON public.habit_tracking FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracking" 
  ON public.habit_tracking FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracking" 
  ON public.habit_tracking FOR DELETE 
  USING (auth.uid() = user_id);

-- POLICIES PER INSIGHTS
CREATE POLICY "Users can view own insights" 
  ON public.insights FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights" 
  ON public.insights FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- POLICIES PER GOALS
CREATE POLICY "Users can view own goals" 
  ON public.goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" 
  ON public.goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
  ON public.goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" 
  ON public.goals FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: Crea automaticamente profilo quando utente si registra
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNZIONI UTILITY
-- =====================================================

-- Calcola consistency score per un utente in un periodo
CREATE OR REPLACE FUNCTION calculate_consistency_score(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS NUMERIC AS $$
DECLARE
  total_possible INTEGER;
  total_completed INTEGER;
  score NUMERIC;
BEGIN
  -- Conta tutte le abitudini attive nel periodo
  SELECT COUNT(DISTINCT h.id) * (p_end_date - p_start_date + 1)
  INTO total_possible
  FROM public.habits h
  WHERE h.user_id = p_user_id 
    AND h.is_active = true
    AND h.created_at::date <= p_end_date;
  
  -- Conta le abitudini completate
  SELECT COUNT(*)
  INTO total_completed
  FROM public.habit_tracking ht
  WHERE ht.user_id = p_user_id
    AND ht.date BETWEEN p_start_date AND p_end_date
    AND ht.completed = true;
  
  -- Calcola percentuale
  IF total_possible > 0 THEN
    score := (total_completed::NUMERIC / total_possible::NUMERIC) * 100;
  ELSE
    score := 0;
  END IF;
  
  RETURN ROUND(score, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATI DI ESEMPIO (Opzionale - commentare se non necessario)
-- =====================================================
/*
-- Inserisci alcune abitudini predefinite per testing
-- Questi verranno automaticamente filtrati da RLS per utente corrente

INSERT INTO public.habits (protocol_id, user_id, name, description, type, icon, color) VALUES
  -- Sostituire con UUID reali dopo aver creato protocollo
  ('protocol-uuid', 'user-uuid', 'Meditazione mattutina', '10 minuti di mindfulness', 'core', '🧘', '#00FFD1'),
  ('protocol-uuid', 'user-uuid', 'Esercizio fisico', '30 minuti di attività', 'core', '🏃', '#A3FF12'),
  ('protocol-uuid', 'user-uuid', 'Lettura', '20 pagine al giorno', 'optional', '📚', '#FFE869');
*/

-- =====================================================
-- FINE SCHEMA
-- =====================================================

-- Per verificare che tutto sia stato creato:
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
