#!/usr/bin/env tsx
// ============================================================
// MIRA — Content Seed Script
// Run: npx tsx supabase/seed.ts
// Requires: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL
// ============================================================

import { createClient } from "@supabase/supabase-js";
import terms from "../content/terms.json";
import archetypes from "../content/archetypes.json";
import quests from "../content/quests.json";
import personas from "../content/personas.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function seed() {
  console.log("🌱 Seeding MIRA content tables...\n");

  // Terms
  console.log(`📚 Seeding ${terms.length} terms...`);
  const { error: termsErr } = await supabase
    .from("terms")
    .upsert(terms, { onConflict: "id" });
  if (termsErr) console.error("  ❌ Terms error:", termsErr.message);
  else console.log(`  ✅ ${terms.length} terms seeded`);

  // Archetypes
  console.log(`🃏 Seeding ${archetypes.length} archetypes...`);
  const { error: archErr } = await supabase
    .from("archetypes")
    .upsert(archetypes, { onConflict: "id" });
  if (archErr) console.error("  ❌ Archetypes error:", archErr.message);
  else console.log(`  ✅ ${archetypes.length} archetypes seeded`);

  // Quests
  console.log(`🎮 Seeding ${quests.length} quests...`);
  const { error: questsErr } = await supabase
    .from("quests")
    .upsert(quests, { onConflict: "id" });
  if (questsErr) console.error("  ❌ Quests error:", questsErr.message);
  else console.log(`  ✅ ${quests.length} quests seeded`);

  // Personas
  console.log(`👤 Seeding ${personas.length} personas...`);
  const { error: personasErr } = await supabase
    .from("personas")
    .upsert(personas, { onConflict: "id" });
  if (personasErr) console.error("  ❌ Personas error:", personasErr.message);
  else console.log(`  ✅ ${personas.length} personas seeded`);

  console.log("\n🎉 Seeding complete!");
}

seed().catch(console.error);
