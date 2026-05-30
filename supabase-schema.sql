-- ============================================================
-- ArthNetra Supabase Database Schema
-- Run this in Supabase SQL Editor → New Query → Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  risk_profile TEXT DEFAULT 'moderate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── PORTFOLIOS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Portfolio',
  investments JSONB DEFAULT '[]',
  total_invested NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own portfolios" ON portfolios USING (auth.uid() = user_id);

-- ── WATCHLISTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'My Watchlist',
  symbols TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own watchlists" ON watchlists USING (auth.uid() = user_id);

-- ── AI HISTORY ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own AI history" ON ai_history USING (auth.uid() = user_id);

-- ── SIMULATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'My Simulation',
  principal NUMERIC DEFAULT 0,
  monthly_sip NUMERIC DEFAULT 0,
  return_rate NUMERIC DEFAULT 12,
  years INTEGER DEFAULT 10,
  future_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own simulations" ON simulations USING (auth.uid() = user_id);

-- ── ECONOMY DATA CACHE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS economy_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  indicator TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  period TEXT,
  source TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user ON ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_economy_data_indicator ON economy_data(indicator);
