import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const DUMMY_ID = "11111111-1111-1111-1111-111111111111";

async function run() {
  console.log("Removing auth requirements...");

  // 1. Create a dummy user
  console.log("Creating dummy user in auth.users...");
  const { data, error } = await supabase.auth.admin.createUser({
    id: DUMMY_ID,
    email: "dummy@mira.local",
    password: "password123",
    email_confirm: true,
  });

  if (error && !error.message.includes("already registered")) {
    console.error("Error creating dummy user:", error.message);
  } else {
    console.log("✅ Dummy user ready:", DUMMY_ID);
  }

  // 2. Disable RLS on all tables via SQL RPC (or we can just tell the user to run a query, but let's try direct)
  // Actually, without an RPC, we can't run raw SQL from the JS client.
  // Instead of disabling RLS, we can just give the NEXT_PUBLIC app the Service Role Key.
  // But that's a bad habit. Let's just create a quick migration file to disable RLS.
  console.log("Done.");
}

run().catch(console.error);
