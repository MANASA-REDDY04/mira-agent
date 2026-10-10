import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export const instant = false;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, progressRes, seasonsRes, termsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("progress").select("*").eq("user_id", user.id).single(),
    supabase
      .from("seasons")
      .select("id, title, nickname, is_seed")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase
      .from("terms")
      .select("id, term, definition, flag_rating")
      .eq("word_of_the_day_eligible", true)
      .limit(50),
  ]);

  const profile = profileRes.data;
  const progress = progressRes.data;
  const seasons = seasonsRes.data ?? [];
  const terms = termsRes.data ?? [];

  // Pick word of the day deterministically by date
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  const wotd = terms.length > 0 ? terms[dayOfYear % terms.length] : null;

  const LEVEL_NAMES = [
    "Rookie",
    "Decoder",
    "Smooth Communicator",
    "Green-Flag Energy",
    "Relationship Sensei",
  ];
  const level = progress?.level ?? 1;
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const xp = progress?.xp ?? 0;
  const nextLevelXp = level * 500;
  const xpPercent = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <HomeClient
      profile={profile}
      progress={progress}
      seasons={seasons}
      wotd={wotd}
      levelName={levelName}
      xpPercent={xpPercent}
      nextLevelXp={nextLevelXp}
    />
  );
}
