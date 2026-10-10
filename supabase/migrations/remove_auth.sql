-- ============================================================
-- RUN THIS IN THE SUPABASE SQL EDITOR TO REMOVE AUTH COMPLETELY
-- ============================================================

-- 1. Disable Row Level Security on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE seasons DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE flag_checks DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE term_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE quest_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE archetypes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quests DISABLE ROW LEVEL SECURITY;
ALTER TABLE personas DISABLE ROW LEVEL SECURITY;

-- 2. Drop foreign key constraints linking to auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE seasons DROP CONSTRAINT IF EXISTS seasons_user_id_fkey;
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;
ALTER TABLE practice_runs DROP CONSTRAINT IF EXISTS practice_runs_user_id_fkey;
ALTER TABLE flag_checks DROP CONSTRAINT IF EXISTS flag_checks_user_id_fkey;
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;
ALTER TABLE insights DROP CONSTRAINT IF EXISTS insights_user_id_fkey;
ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_user_id_fkey;
ALTER TABLE term_favorites DROP CONSTRAINT IF EXISTS term_favorites_user_id_fkey;
ALTER TABLE quest_runs DROP CONSTRAINT IF EXISTS quest_runs_user_id_fkey;

-- 3. Pre-create the dummy user profile & progress so the app doesn't crash
INSERT INTO profiles (id, display_name, mira_name, language_mode, theme, onboarding_done)
VALUES ('11111111-1111-1111-1111-111111111111', 'Dharshan', 'Mira', 'english', 'dark', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO progress (user_id, xp, level, streak, badges)
VALUES ('11111111-1111-1111-1111-111111111111', 0, 1, 0, '{}')
ON CONFLICT (user_id) DO NOTHING;
