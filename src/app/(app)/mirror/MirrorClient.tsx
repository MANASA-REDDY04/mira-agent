"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star, Flame, Trophy, ChevronRight, Settings, LogOut, Brain
} from "lucide-react";
import type { Profile, Progress, Insight } from "@/types/supabase";

interface MirrorClientProps {
  profile: Profile | null;
  progress: Progress | null;
  insights: Insight[];
}

const LEVEL_NAMES = [
  "Rookie", "Decoder", "Smooth Communicator", "Green-Flag Energy", "Relationship Sensei"
];
const BADGE_EMOJIS: Record<string, string> = {
  first_chat: "💬",
  five_chats: "🗣️",
  first_season: "📖",
  dtr_master: "🎯",
  vibe_checker: "🔍",
  decoder_pro: "🔑",
};

export default function MirrorClient({ profile, progress, insights }: MirrorClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const level = progress?.level ?? 1;
  const xp = progress?.xp ?? 0;
  const streak = progress?.streak ?? 0;
  const badges = progress?.badges ?? [];
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const nextLevelXp = level * 500;
  const xpPercent = Math.min((xp / nextLevelXp) * 100, 100);

  const confirmedInsights = insights.filter((i) => i.status === "confirmed");
  const suggestedInsights = insights.filter((i) => i.status === "suggested");

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4 space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--mira-coral)] to-[var(--mira-lavender)] flex items-center justify-center text-3xl">
          🪞
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{profile?.display_name ?? "Dharshan"}</h1>
          <p className="text-sm text-muted-foreground">{levelName}</p>
        </div>
        <Link href="/memory" id="mirror-settings">
          <div className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <Star className="w-5 h-5 text-[var(--mira-coral)] mx-auto mb-1" />
          <p className="text-lg font-bold">{xp}</p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-lg font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">streak</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <Trophy className="w-5 h-5 text-[var(--mira-lavender)] mx-auto mb-1" />
          <p className="text-lg font-bold">{badges.length}</p>
          <p className="text-xs text-muted-foreground">badges</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Level {level}: {levelName}</span>
          <span>{xp}/{nextLevelXp} XP</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--mira-coral)] to-[var(--mira-lavender)]"
          />
        </div>
        {xp >= nextLevelXp && (
          <p className="text-xs text-[var(--mira-coral)] mt-1 font-medium">🎉 ready to level up!</p>
        )}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">badges earned</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm"
              >
                <span>{BADGE_EMOJIS[badge] ?? "🏅"}</span>
                <span className="text-xs capitalize">{badge.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3 h-3" /> Mira&apos;s insights
          </p>
          <Link href="/memory?tab=insights" className="text-xs text-[var(--mira-coral)] font-medium" id="mirror-all-insights">
            see all
          </Link>
        </div>

        {confirmedInsights.length === 0 && suggestedInsights.length === 0 && (
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <p className="text-sm text-muted-foreground">chat with Mira to start building your picture 💬</p>
          </div>
        )}

        {suggestedInsights.slice(0, 2).map((insight) => (
          <div key={insight.id} className="p-4 rounded-2xl bg-card border border-border mb-2">
            <p className="text-xs font-semibold text-[var(--mira-flag-yellow)] mb-1">💡 suggested</p>
            <p className="text-sm">{insight.text}</p>
            <p className="text-xs text-muted-foreground mt-1">confirm or dismiss in My Memory</p>
          </div>
        ))}

        {confirmedInsights.slice(0, 2).map((insight) => (
          <div key={insight.id} className="p-4 rounded-2xl bg-[var(--mira-flag-green)]/10 border border-[var(--mira-flag-green)]/30 mb-2">
            <p className="text-xs font-semibold text-[var(--mira-flag-green)] mb-1">✓ confirmed</p>
            <p className="text-sm">{insight.text}</p>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="space-y-2">
        {[
          { href: "/memory", label: "My Memory", emoji: "🧠", id: "mirror-memory" },
          { href: "/chat", label: "Talk to Mira", emoji: "💬", id: "mirror-chat" },
        ].map((link) => (
          <Link key={link.href} href={link.href} id={link.id}>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-border/50 transition-all">
              <span className="text-xl">{link.emoji}</span>
              <span className="text-sm font-medium flex-1">{link.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <button
        id="mirror-signout"
        onClick={handleSignOut}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-muted-foreground text-sm hover:bg-muted/50 transition-all"
      >
        <LogOut className="w-4 h-4" />
        sign out
      </button>
    </div>
  );
}
