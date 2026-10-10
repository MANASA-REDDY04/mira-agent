import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MemoryClient from "./MemoryClient";

export const instant = false;

export default async function MemoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [seasonsRes, insightsRes, journalRes] = await Promise.all([
    supabase
      .from("seasons")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase
      .from("insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <MemoryClient
      seasons={seasonsRes.data ?? []}
      insights={insightsRes.data ?? []}
      journalEntries={journalRes.data ?? []}
    />
  );
}
