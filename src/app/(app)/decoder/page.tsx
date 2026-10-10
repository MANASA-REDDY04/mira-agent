import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DecoderClient from "./DecoderClient";

export const instant = false;

export default async function DecoderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [termsRes, favRes, archetypesRes] = await Promise.all([
    supabase.from("terms").select("*").order("term"),
    supabase.from("term_favorites").select("term_id").eq("user_id", user.id),
    supabase.from("archetypes").select("*"),
  ]);

  return (
    <DecoderClient
      terms={termsRes.data ?? []}
      favorites={favRes.data?.map((f) => f.term_id) ?? []}
      archetypes={archetypesRes.data ?? []}
    />
  );
}
