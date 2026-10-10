import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

export const instant = false;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_done")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_done) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 pb-nav">{children}</main>
      <BottomNav />
    </div>
  );
}
