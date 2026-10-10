"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageCircle,
  BookOpen,
  Swords,
  Flame,
  Star,
  ChevronRight,
} from "lucide-react";
import type { Profile, Progress, Season, Term } from "@/types/supabase";

interface HomeClientProps {
  profile: Profile | null;
  progress: Progress | null;
  seasons: Pick<Season, "id" | "title" | "nickname" | "is_seed">[];
  wotd: Pick<Term, "id" | "term" | "definition" | "flag_rating"> | null;
  levelName: string;
  xpPercent: number;
  nextLevelXp: number;
}

const DAILY_TEAS = [
  {
    emoji: "☕",
    tip: "green flags aren't exciting — that's the point. calm is not boring, it's safe.",
  },
  {
    emoji: "🧠",
    tip: "you can like someone AND see red flags. both things are true. the question is what you do with that.",
  },
  {
    emoji: "💬",
    tip: "asking someone how they feel about something is not weak. it's emotionally intelligent.",
  },
  {
    emoji: "🚩",
    tip: "ghosting tells you what you need to know — someone who'd do it to you doesn't deserve your energy.",
  },
  {
    emoji: "✨",
    tip: "DTR isn't scary — ambiguity is scarier. you deserve to know where you stand.",
  },
  {
    emoji: "🌿",
    tip: "apologising properly means: acknowledging what happened, no excuses, and asking what they need.",
  },
  {
    emoji: "💪",
    tip: "needing to slow something down isn't rejection — it's self-awareness. say it kindly.",
  },
];

const quickActions = [
  {
    href: "/chat",
    label: "talk to Mira",
    desc: "vibe check, decode texts, get advice",
    emoji: "💬",
    color: "from-[var(--mira-coral)] to-[var(--mira-lavender)]",
    id: "home-chat-btn",
  },
  {
    href: "/decoder",
    label: "dictionary",
    desc: "40+ gen-z dating terms",
    emoji: "📖",
    color: "from-[var(--mira-lavender)] to-purple-500",
    id: "home-decoder-btn",
  },
  {
    href: "/dynamics",
    label: "analyze dynamic",
    desc: "see who's at fault",
    emoji: "⚖️",
    color: "from-blue-500 to-[var(--mira-lavender)]",
    id: "home-dynamics-btn",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function HomeClient({
  profile,
  progress,
  seasons,
  wotd,
  levelName,
  xpPercent,
  nextLevelXp,
}: HomeClientProps) {
  const name = profile?.display_name ?? "there";
  const miraName = profile?.mira_name ?? "Mira";
  const dayIdx =
    Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    ) % DAILY_TEAS.length;
  const tea = DAILY_TEAS[dayIdx];
  const streak = progress?.streak ?? 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground">hey, {name} 👋</p>
          <h1 className="text-2xl font-bold text-gradient-coral">
            {miraName}&apos;s Daily Hub
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold">{streak}</span>
        </div>
      </motion.div>

      {/* XP / Level bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-card border border-border"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[var(--mira-coral)]" />
            <span className="text-sm font-semibold">{levelName}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {progress?.xp ?? 0} / {nextLevelXp} XP
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--mira-coral)] to-[var(--mira-lavender)]"
          />
        </div>
      </motion.div>

      {/* Daily Tea */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-[var(--mira-coral-light)] to-[var(--mira-lavender-light)] border border-[var(--mira-coral)]/20 relative overflow-hidden"
      >
        <div className="absolute top-3 right-4 text-3xl opacity-20">☕</div>
        <p className="text-xs font-semibold text-[var(--mira-coral)] uppercase tracking-wider mb-2">
          {miraName}&apos;s daily tea ☕
        </p>
        <p className="text-sm font-medium leading-relaxed">
          {tea.emoji} &ldquo;{tea.tip}&rdquo;
        </p>
      </motion.div>

      {/* Word of the Day */}
      {wotd && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href={`/decoder?term=${wotd.id}`} id="home-wotd">
            <div className="p-5 rounded-3xl bg-card border border-border hover:border-[var(--mira-lavender)]/50 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  word of the day 📚
                </p>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold">{wotd.term}</span>
                {wotd.flag_rating && wotd.flag_rating !== "neutral" && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      wotd.flag_rating === "green"
                        ? "bg-[var(--mira-flag-green)]/15 border-[var(--mira-flag-green)]/30 text-[var(--mira-flag-green)]"
                        : wotd.flag_rating === "red"
                          ? "bg-[var(--mira-flag-red)]/15 border-[var(--mira-flag-red)]/30 text-[var(--mira-flag-red)]"
                          : "bg-[var(--mira-flag-yellow)]/15 border-[var(--mira-flag-yellow)]/30 text-[var(--mira-flag-yellow)]"
                    }`}
                  >
                    {wotd.flag_rating} flag
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {wotd.definition}
              </p>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={container} initial="hidden" animate="show">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          quick actions
        </p>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => (
            <motion.div key={action.href} variants={item}>
              <Link href={action.href} id={action.id}>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-border/50 active:scale-98 transition-all group">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl flex-shrink-0`}
                  >
                    {action.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{action.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Seasons */}
      {seasons.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              your seasons
            </p>
            <Link
              href="/memory"
              className="text-xs text-[var(--mira-coral)] font-medium"
              id="home-view-seasons"
            >
              view all
            </Link>
          </div>
          <div className="space-y-2">
            {seasons.slice(0, 3).map((season, i) => (
              <Link
                key={season.id}
                href={`/memory?season=${season.id}`}
                id={`home-season-${i}`}
              >
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-border/50 transition-all">
                  <span className="text-lg">
                    {i === 0 ? "💛" : i === 1 ? "🌸" : "🌪️"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{season.title}</p>
                    {season.is_seed && (
                      <p className="text-xs text-muted-foreground">seed data</p>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
