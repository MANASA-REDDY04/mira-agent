"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronRight, Sparkles } from "lucide-react";

type Step = "welcome" | "profile" | "seasons" | "done";

const SEED_SEASONS = [
  {
    title: "Season 1: The First One",
    nickname: "S1",
    summary:
      "His first relationship. It ended with her hurt and crying. The hardest part was not knowing how to handle the end well.",
    lessons: [
      "How to apologise properly",
      "The importance of empathy when things end",
      "Accountability over defensiveness",
    ],
    red_flags_seen: [],
    green_flags_seen: ["genuine first connection", "learning experience"],
    is_seed: true,
  },
  {
    title: "Season 2: The Sweet Almost",
    nickname: "S2",
    summary:
      "A sweet, kind connection that never became a commitment. She eventually put him in the friend zone. He never quite said what he wanted.",
    lessons: [
      "The importance of the DTR conversation",
      "How to read mutual interest without over-analysing",
      "Handling rejection gracefully",
    ],
    red_flags_seen: [],
    green_flags_seen: ["real warmth and care", "good friendship base"],
    is_seed: true,
  },
  {
    title: "Season 3: The Intensity",
    nickname: "S3",
    summary:
      "Lasted about 15 days. She became extremely intense very fast — 'you're the only one, nobody ever talked to me like this.' Felt more like obsession than love.",
    lessons: [
      "What love-bombing looks like and feels like",
      "How to slow down an intense situation kindly",
      "Healthy vs unhealthy pace of intimacy",
    ],
    red_flags_seen: [
      "love-bombing",
      "unrealistic intensity in days",
      "exclusivity pressure",
    ],
    green_flags_seen: [],
    is_seed: true,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [displayName, setDisplayName] = useState("Dharshan");
  const [miraName, setMiraName] = useState("Mira");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleComplete() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile
    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName,
      mira_name: miraName,
      onboarding_done: true,
    });

    // Insert seed seasons
    await supabase.from("seasons").insert(
      SEED_SEASONS.map((s) => ({
        ...s,
        user_id: user.id,
        stage_reached: null,
        started_on: null,
        ended_on: null,
        green_flags_seen: s.green_flags_seen,
        red_flags_seen: s.red_flags_seen,
        is_private: false,
      }))
    );

    setStep("done");
    setTimeout(() => router.push("/"), 2000);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--mira-coral)] opacity-10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[var(--mira-lavender)] opacity-10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <AnimatePresence mode="wait">
          {/* WELCOME */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl animate-bounce-subtle">✨</div>
              <h1 className="text-3xl font-bold text-gradient-coral">
                hey, you made it!
              </h1>
              <p className="text-muted-foreground">
                I&apos;m <strong className="text-foreground">Mira</strong> — your
                big-sister guide to figuring out relationships, dating language,
                and yourself. no judgment, no lecture. just real talk.
              </p>
              <p className="text-sm text-muted-foreground">
                I&apos;ll remember your past seasons to make advice more personal
                over time. you can edit or delete everything, always.
              </p>
              <button
                id="onboard-start-btn"
                onClick={() => setStep("profile")}
                className="w-full py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[var(--mira-coral)] to-[var(--mira-lavender)] text-white hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                let&apos;s go <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* PROFILE */}
          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">👤</div>
                <h2 className="text-2xl font-bold">quick setup</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  you can change all of this later
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
                    what should I call you?
                  </label>
                  <input
                    id="display-name-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--mira-coral)]/50 transition-all"
                    placeholder="Dharshan"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
                    what should I name my guide?
                  </label>
                  <input
                    id="mira-name-input"
                    type="text"
                    value={miraName}
                    onChange={(e) => setMiraName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--mira-coral)]/50 transition-all"
                    placeholder="Mira"
                  />
                </div>
              </div>

              <button
                id="onboard-profile-next"
                onClick={() => setStep("seasons")}
                disabled={!displayName.trim()}
                className="w-full py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[var(--mira-coral)] to-[var(--mira-lavender)] text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* SEASONS PREVIEW */}
          {step === "seasons" && (
            <motion.div
              key="seasons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📖</div>
                <h2 className="text-2xl font-bold">your story so far</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  I&apos;ve pre-loaded 3 seasons based on what I know. edit them
                  anytime — or delete and start fresh.
                </p>
              </div>

              <div className="space-y-3">
                {SEED_SEASONS.map((season, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-card border border-border"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {i === 0 ? "💛" : i === 1 ? "🌸" : "🌪️"}
                      </span>
                      <span className="font-semibold text-sm">
                        {season.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {season.summary}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                these are marked as seed data. only you can see them.
              </p>

              <button
                id="onboard-complete-btn"
                onClick={handleComplete}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-[var(--mira-coral)] to-[var(--mira-lavender)] text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    let&apos;s start
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* DONE */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
                className="text-6xl"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold">you&apos;re all set!</h2>
              <p className="text-muted-foreground">taking you to {miraName}…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
