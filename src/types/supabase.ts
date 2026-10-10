export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LanguageMode = "english" | "tanglish";
export type ChatMode =
  | "chat"
  | "vibe_check"
  | "text_decoder"
  | "practice"
  | "post_mortem"
  | "reality_check"
  | "backfill";
export type MessageRole = "user" | "assistant";
export type InsightKind = "pattern" | "strength" | "growth_area";
export type InsightStatus = "suggested" | "confirmed" | "dismissed";
export type FlagRating = "green" | "yellow" | "red" | "neutral";
export type Theme = "dark" | "light" | "system";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  mira_name: string;
  language_mode: LanguageMode;
  theme: Theme;
  onboarding_done: boolean;
  created_at: string;
  updated_at: string;
};

export type SeasonRow = {
  id: string;
  user_id: string;
  nickname: string | null;
  title: string;
  summary: string | null;
  stage_reached: string | null;
  started_on: string | null;
  ended_on: string | null;
  lessons: string[];
  red_flags_seen: string[];
  green_flags_seen: string[];
  is_seed: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

export type ChatSessionRow = {
  id: string;
  user_id: string;
  mode: ChatMode;
  title: string | null;
  season_id: string | null;
  summary: string | null;
  summarized_at: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  session_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  meta: Json | null;
  created_at: string;
};

export type PracticeRunRow = {
  id: string;
  user_id: string;
  persona: string;
  goal: string;
  transcript: Json;
  scorecard: Json | null;
  created_at: string;
  updated_at: string;
};

export type FlagCheckRow = {
  id: string;
  user_id: string;
  season_id: string | null;
  answers: Json;
  score: number | null;
  commentary: string | null;
  created_at: string;
};

export type JournalEntryRow = {
  id: string;
  user_id: string;
  mood: string | null;
  text: string;
  season_id: string | null;
  created_at: string;
  updated_at: string;
};

export type InsightRow = {
  id: string;
  user_id: string;
  kind: InsightKind;
  text: string;
  status: InsightStatus;
  evidence: Json;
  season_ids: string[];
  created_at: string;
  updated_at: string;
};

export type ProgressRow = {
  user_id: string;
  xp: number;
  level: number;
  streak: number;
  last_active_on: string | null;
  badges: string[];
  created_at: string;
  updated_at: string;
};

export type TermFavoriteRow = { user_id: string; term_id: string; created_at: string };

export type QuestRunRow = {
  id: string;
  user_id: string;
  quest_id: string;
  choices: Json;
  outcome: string | null;
  xp_awarded: number;
  created_at: string;
};

export type TermRow = {
  id: string;
  term: string;
  definition: string;
  example: string | null;
  how_it_feels: string | null;
  flag_rating: FlagRating | null;
  what_to_do: string | null;
  tags: string[];
  indian_context: string | null;
  word_of_the_day_eligible: boolean;
  created_at: string;
};

export type ArchetypeRow = {
  id: string;
  name: string;
  subtitle: string | null;
  early_signs: string[];
  how_it_feels: string | null;
  green_flags: string[];
  red_flags: string[];
  how_to_respond: string | null;
  nuance_note: string | null;
  emoji: string | null;
  color_class: string | null;
  created_at: string;
};

export type QuestRow = {
  id: string;
  title: string;
  setup: string;
  nodes: Json;
  xp_reward: number;
  tags: string[];
  created_at: string;
};

export type PersonaRow = {
  id: string;
  name: string;
  description: string;
  traits: string[];
  example_scenarios: string[];
  emoji: string | null;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
        Relationships: any[];
      };
      seasons: {
        Row: SeasonRow;
        Insert: Partial<SeasonRow>;
        Update: Partial<SeasonRow>;
        Relationships: any[];
      };
      chat_sessions: {
        Row: ChatSessionRow;
        Insert: Partial<ChatSessionRow>;
        Update: Partial<ChatSessionRow>;
        Relationships: any[];
      };
      messages: {
        Row: MessageRow;
        Insert: Partial<MessageRow>;
        Update: Partial<MessageRow>;
        Relationships: any[];
      };
      practice_runs: {
        Row: PracticeRunRow;
        Insert: Partial<PracticeRunRow>;
        Update: Partial<PracticeRunRow>;
        Relationships: any[];
      };
      flag_checks: {
        Row: FlagCheckRow;
        Insert: Partial<FlagCheckRow>;
        Update: Partial<FlagCheckRow>;
        Relationships: any[];
      };
      journal_entries: {
        Row: JournalEntryRow;
        Insert: Partial<JournalEntryRow>;
        Update: Partial<JournalEntryRow>;
        Relationships: any[];
      };
      insights: {
        Row: InsightRow;
        Insert: Partial<InsightRow>;
        Update: Partial<InsightRow>;
        Relationships: any[];
      };
      progress: {
        Row: ProgressRow;
        Insert: Partial<ProgressRow>;
        Update: Partial<ProgressRow>;
        Relationships: any[];
      };
      term_favorites: {
        Row: TermFavoriteRow;
        Insert: Partial<TermFavoriteRow>;
        Update: Partial<TermFavoriteRow>;
        Relationships: any[];
      };
      quest_runs: {
        Row: QuestRunRow;
        Insert: Partial<QuestRunRow>;
        Update: Partial<QuestRunRow>;
        Relationships: any[];
      };
      terms: {
        Row: TermRow;
        Insert: Partial<TermRow>;
        Update: Partial<TermRow>;
        Relationships: any[];
      };
      archetypes: {
        Row: ArchetypeRow;
        Insert: Partial<ArchetypeRow>;
        Update: Partial<ArchetypeRow>;
        Relationships: any[];
      };
      quests: {
        Row: QuestRow;
        Insert: Partial<QuestRow>;
        Update: Partial<QuestRow>;
        Relationships: any[];
      };
      personas: {
        Row: PersonaRow;
        Insert: Partial<PersonaRow>;
        Update: Partial<PersonaRow>;
        Relationships: any[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      language_mode: LanguageMode;
      chat_mode: ChatMode;
      message_role: MessageRole;
      insight_kind: InsightKind;
      insight_status: InsightStatus;
      flag_rating: FlagRating;
    };
  };
}

export type Profile = ProfileRow;
export type Season = SeasonRow;
export type ChatSession = ChatSessionRow;
export type Message = MessageRow;
export type PracticeRun = PracticeRunRow;
export type FlagCheck = FlagCheckRow;
export type JournalEntry = JournalEntryRow;
export type Insight = InsightRow;
export type Progress = ProgressRow;
export type Term = TermRow;
export type Archetype = ArchetypeRow;
export type Quest = QuestRow;
export type Persona = PersonaRow;
