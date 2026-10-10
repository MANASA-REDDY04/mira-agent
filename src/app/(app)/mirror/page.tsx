import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MirrorClient from "./MirrorClient";

export const instant = false;

export default async function MirrorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, progressRes, insightsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("progress").select("*").eq("user_id", user.id).single(),
    supabase
      .from("insights")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["suggested", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <MirrorClient
      profile={profileRes.data}
      progress={progressRes.data}
      insights={insightsRes.data ?? []}
    />
  );
}
