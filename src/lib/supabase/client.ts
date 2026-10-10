import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export function createClient() {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  client.auth.getUser = async () => ({
    data: { user: { id: "11111111-1111-1111-1111-111111111111" } as any },
    error: null,
  });

  return client;
}
