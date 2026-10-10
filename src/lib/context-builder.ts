// ============================================================
// MIRA — Context Builder ("Mira Remembers" pipeline)
// Builds the system context for every LLM call from Supabase.
// ============================================================

import { createClient } from "@/lib/supabase/server";

const MAX_CONTEXT_TOKENS = 6000; // rough char budget (~4 chars/token)
const MAX_CHARS = MAX_CONTEXT_TOKENS * 4;

export interface MiraContext {
  systemContext: string;
  miraName: string;
  languageMode: string;
}

export async function buildMiraContext(
  userId: string,
  currentSessionId?: string
): Promise<MiraContext> {
  const supabase = await createClient();
  const parts: string[] = [];

  // 1. Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, mira_name, language_mode")
    .eq("id", userId)
    .single();

  const miraName = profile?.mira_name ?? "Mira";
  const languageMode = profile?.language_mode ?? "english";
  const displayName = profile?.display_name ?? "Dharshan";

  parts.push(`== USER CONTEXT ==`);
  parts.push(`User: ${displayName}`);
  parts.push(`Language mode: ${languageMode}`);
  parts.push(``);

  // 2. Seasons (skip private)
  const { data: seasons } = await supabase
    .from("seasons")
    .select(
      "id, title, nickname, summary, stage_reached, lessons, red_flags_seen, green_flags_seen, is_seed"
    )
    .eq("user_id", userId)
    .eq("is_private", false)
    .order("created_at", { ascending: true });

  if (seasons && seasons.length > 0) {
    parts.push(`== DHARSHAN'S SEASONS ==`);
    for (const s of seasons) {
      const nick = s.nickname ? ` (${s.nickname})` : "";
      parts.push(`Season: ${s.title}${nick}`);
      if (s.summary) parts.push(`  Summary: ${s.summary}`);
      if (s.stage_reached) parts.push(`  Reached: ${s.stage_reached}`);
      if (s.lessons?.length) parts.push(`  Lessons: ${s.lessons.join("; ")}`);
      if (s.red_flags_seen?.length)
        parts.push(`  Red flags seen: ${s.red_flags_seen.join(", ")}`);
      if (s.green_flags_seen?.length)
        parts.push(`  Green flags seen: ${s.green_flags_seen.join(", ")}`);
      parts.push(``);
    }
  }

  // 3. Confirmed insights only
  const { data: insights } = await supabase
    .from("insights")
    .select("kind, text")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(10);

  if (insights && insights.length > 0) {
    parts.push(`== CONFIRMED PATTERNS ABOUT DHARSHAN ==`);
    for (const i of insights) {
      parts.push(`[${i.kind.toUpperCase()}] ${i.text}`);
    }
    parts.push(``);
  }

  // 4. Recent session summaries (5 most recent, not current)
  const { data: recentSessions } = await supabase
    .from("chat_sessions")
    .select("id, title, mode, summary, season_id")
    .eq("user_id", userId)
    .not("summary", "is", null)
    .order("created_at", { ascending: false })
    .limit(5);

  const filteredSessions = recentSessions?.filter(
    (s) => s.id !== currentSessionId
  );

  if (filteredSessions && filteredSessions.length > 0) {
    parts.push(`== RECENT CHAT SUMMARIES ==`);
    for (const s of filteredSessions) {
      const title = s.title ?? `${s.mode} session`;
      parts.push(`[${title}]: ${s.summary}`);
    }
    parts.push(``);
  }

  // 5. Truncate to budget
  let systemContext = parts.join("\n");
  if (systemContext.length > MAX_CHARS) {
    systemContext = systemContext.slice(0, MAX_CHARS) + "\n[Context truncated]";
  }

  return { systemContext, miraName, languageMode };
}
