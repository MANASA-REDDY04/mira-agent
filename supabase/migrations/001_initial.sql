-- ============================================================
-- MIRA - Initial Migration
-- ============================================================
-- Run this in the Supabase SQL editor or via supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- USER TABLES
-- ============================================================

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  mira_name       TEXT NOT NULL DEFAULT 'Mira',
  language_mode   TEXT NOT NULL DEFAULT 'english' CHECK (language_mode IN ('english', 'tanglish')),
  theme           TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: user owns their row"
  ON profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- seasons
CREATE TABLE IF NOT EXISTS seasons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname        TEXT,
  title           TEXT NOT NULL,
  summary         TEXT,
  stage_reached   TEXT,
  started_on      DATE,
  ended_on        DATE,
  lessons         TEXT[] DEFAULT '{}',
  red_flags_seen  TEXT[] DEFAULT '{}',
  green_flags_seen TEXT[] DEFAULT '{}',
  is_seed         BOOLEAN NOT NULL DEFAULT FALSE,
  is_private      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seasons_user_created ON seasons (user_id, created_at);

CREATE TRIGGER seasons_updated_at
  BEFORE UPDATE ON seasons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seasons: user owns their rows"
  ON seasons FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- chat_sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mode            TEXT NOT NULL DEFAULT 'chat' CHECK (mode IN ('chat','vibe_check','text_decoder','practice','post_mortem','reality_check','backfill')),
  title           TEXT,
  season_id       UUID REFERENCES seasons(id) ON DELETE SET NULL,
  summary         TEXT,
  summarized_at   TIMESTAMPTZ,
  message_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_created ON chat_sessions (user_id, created_at);

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions: user owns their rows"
  ON chat_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- messages
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  meta            JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_session_created ON messages (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages (user_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages: user owns their rows"
  ON messages FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- practice_runs
CREATE TABLE IF NOT EXISTS practice_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  persona         TEXT NOT NULL,
  goal            TEXT NOT NULL,
  transcript      JSONB NOT NULL DEFAULT '[]',
  scorecard       JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_runs_user_created ON practice_runs (user_id, created_at);

CREATE TRIGGER practice_runs_updated_at
  BEFORE UPDATE ON practice_runs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE practice_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "practice_runs: user owns their rows"
  ON practice_runs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- flag_checks
CREATE TABLE IF NOT EXISTS flag_checks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id       UUID REFERENCES seasons(id) ON DELETE SET NULL,
  answers         JSONB NOT NULL DEFAULT '{}',
  score           INTEGER,
  commentary      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flag_checks_user_created ON flag_checks (user_id, created_at);

ALTER TABLE flag_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flag_checks: user owns their rows"
  ON flag_checks FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- journal_entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mood            TEXT,
  text            TEXT NOT NULL,
  season_id       UUID REFERENCES seasons(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created ON journal_entries (user_id, created_at);

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_entries: user owns their rows"
  ON journal_entries FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- insights
CREATE TABLE IF NOT EXISTS insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL CHECK (kind IN ('pattern', 'strength', 'growth_area')),
  text            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'confirmed', 'dismissed')),
  evidence        JSONB DEFAULT '{}',
  season_ids      UUID[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_user_created ON insights (user_id, created_at);

CREATE TRIGGER insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights: user owns their rows"
  ON insights FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- progress
CREATE TABLE IF NOT EXISTS progress (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp              INTEGER NOT NULL DEFAULT 0,
  level           INTEGER NOT NULL DEFAULT 1,
  streak          INTEGER NOT NULL DEFAULT 0,
  last_active_on  DATE,
  badges          TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress: user owns their row"
  ON progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- term_favorites
CREATE TABLE IF NOT EXISTS term_favorites (
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term_id         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, term_id)
);

ALTER TABLE term_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "term_favorites: user owns their rows"
  ON term_favorites FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- quest_runs
CREATE TABLE IF NOT EXISTS quest_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id        TEXT NOT NULL,
  choices         JSONB NOT NULL DEFAULT '[]',
  outcome         TEXT,
  xp_awarded      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_runs_user_created ON quest_runs (user_id, created_at);

ALTER TABLE quest_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quest_runs: user owns their rows"
  ON quest_runs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- PUBLIC CONTENT TABLES (read-only for authenticated users)
-- ============================================================

-- terms (glossary)
CREATE TABLE IF NOT EXISTS terms (
  id              TEXT PRIMARY KEY,
  term            TEXT NOT NULL,
  definition      TEXT NOT NULL,
  example         TEXT,
  how_it_feels    TEXT,
  flag_rating     TEXT CHECK (flag_rating IN ('green', 'yellow', 'red', 'neutral')),
  what_to_do      TEXT,
  tags            TEXT[] DEFAULT '{}',
  indian_context  TEXT,
  word_of_the_day_eligible BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terms: authenticated users can read"
  ON terms FOR SELECT
  TO authenticated
  USING (TRUE);

-- archetypes (pattern decoder cards)
CREATE TABLE IF NOT EXISTS archetypes (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  subtitle        TEXT,
  early_signs     TEXT[] DEFAULT '{}',
  how_it_feels    TEXT,
  green_flags     TEXT[] DEFAULT '{}',
  red_flags       TEXT[] DEFAULT '{}',
  how_to_respond  TEXT,
  nuance_note     TEXT,
  emoji           TEXT,
  color_class     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE archetypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archetypes: authenticated users can read"
  ON archetypes FOR SELECT
  TO authenticated
  USING (TRUE);

-- quests (scenario quests)
CREATE TABLE IF NOT EXISTS quests (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  setup           TEXT NOT NULL,
  nodes           JSONB NOT NULL DEFAULT '[]',
  xp_reward       INTEGER NOT NULL DEFAULT 50,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quests: authenticated users can read"
  ON quests FOR SELECT
  TO authenticated
  USING (TRUE);

-- personas (practice arena)
CREATE TABLE IF NOT EXISTS personas (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  traits          TEXT[] DEFAULT '{}',
  example_scenarios TEXT[] DEFAULT '{}',
  emoji           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personas: authenticated users can read"
  ON personas FOR SELECT
  TO authenticated
  USING (TRUE);

-- ============================================================
-- FUNCTION: auto-create profile and progress on sign-up
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO progress (user_id, last_active_on)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS VERIFICATION VIEW (for testing - not exposed to client)
-- ============================================================
-- To test isolation: sign in as user A, try to query user B's seasons.
-- The RLS policy ensures user_id = auth.uid() so the query returns 0 rows.
