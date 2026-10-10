"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Season, Insight, JournalEntry } from "@/types/supabase";
import { Trash2, Lock, Unlock, Plus, Download, ChevronDown, ChevronUp, Brain, BookHeart, Leaf } from "lucide-react";

interface MemoryClientProps {
  seasons: Season[];
  insights: Insight[];
  journalEntries: JournalEntry[];
}

const SEASON_EMOJIS = ["💛", "🌸", "🌪️", "💙", "🌟", "🔥", "🌙", "🌈"];

export default function MemoryClient({ seasons, insights, journalEntries }: MemoryClientProps) {
  const [tab, setTab] = useState<"seasons" | "insights" | "journal">("seasons");
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [localSeasons, setLocalSeasons] = useState(seasons);
  const [localInsights, setLocalInsights] = useState(insights);
  const supabase = createClient();

  async function togglePrivate(season: Season) {
    const { data } = await supabase
      .from("seasons")
      .update({ is_private: !season.is_private })
      .eq("id", season.id)
      .select()
      .single();
    if (data) {
      setLocalSeasons((prev) => prev.map((s) => (s.id === season.id ? data : s)));
    }
  }

  async function deleteSeason(id: string) {
    if (!confirm("Delete this season? This cannot be undone.")) return;
    await supabase.from("seasons").delete().eq("id", id);
    setLocalSeasons((prev) => prev.filter((s) => s.id !== id));
  }

  async function updateInsightStatus(id: string, status: "confirmed" | "dismissed") {
    const { data } = await supabase
      .from("insights")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (data) {
      setLocalInsights((prev) => prev.map((i) => (i.id === id ? data : i)));
    }
  }

  function exportData() {
    const blob = new Blob(
      [JSON.stringify({ seasons: localSeasons, insights: localInsights, journalEntries }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mira-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteEverything() {
    if (!confirm("Delete ALL your data? This will also sign you out. This cannot be undone.")) return;
    await supabase.from("seasons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("insights").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("journal_entries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const confirmedInsights = localInsights.filter((i) => i.status === "confirmed");
  const suggestedInsights = localInsights.filter((i) => i.status === "suggested");

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Memory 🧠</h1>
          <p className="text-sm text-muted-foreground">everything Mira remembers about you</p>
        </div>
        <button
          id="export-btn"
          onClick={exportData}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all"
        >
          <Download className="w-4 h-4" />
          export
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl bg-muted mb-6">
        {(["seasons", "insights", "journal"] as const).map((t) => (
          <button
            key={t}
            id={`memory-tab-${t}`}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              tab === t
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* SEASONS */}
        {tab === "seasons" && (
          <motion.div
            key="seasons"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">{localSeasons.length} seasons</p>
              <a href="/memory/new-season" id="add-season-btn" className="flex items-center gap-1 text-sm text-[var(--mira-coral)] font-medium">
                <Plus className="w-4 h-4" /> add season
              </a>
            </div>

            {localSeasons.map((season, i) => (
              <div key={season.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
                  id={`season-expand-${i}`}
                >
                  <span className="text-xl flex-shrink-0">{SEASON_EMOJIS[i % SEASON_EMOJIS.length]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{season.title}</p>
                      {season.is_seed && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">seed</span>
                      )}
                      {season.is_private && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--mira-lavender)]/20 text-[var(--mira-lavender)]">private</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{season.summary ?? "no summary yet"}</p>
                  </div>
                  {expandedSeason === season.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSeason === season.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                        {season.lessons?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">lessons</p>
                            <ul className="space-y-1">
                              {season.lessons.map((l, j) => (
                                <li key={j} className="text-sm flex items-start gap-2">
                                  <span className="text-[var(--mira-coral)] mt-0.5">•</span>
                                  {l}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {season.red_flags_seen?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-[var(--mira-flag-red)] mb-1">red flags seen</p>
                            <div className="flex flex-wrap gap-1.5">
                              {season.red_flags_seen.map((f, j) => (
                                <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-[var(--mira-flag-red)]/15 text-[var(--mira-flag-red)] border border-[var(--mira-flag-red)]/30">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {season.green_flags_seen?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-[var(--mira-flag-green)] mb-1">green flags seen</p>
                            <div className="flex flex-wrap gap-1.5">
                              {season.green_flags_seen.map((f, j) => (
                                <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-[var(--mira-flag-green)]/15 text-[var(--mira-flag-green)] border border-[var(--mira-flag-green)]/30">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => togglePrivate(season)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-border hover:bg-muted/50 transition-all"
                            id={`season-private-${i}`}
                          >
                            {season.is_private ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {season.is_private ? "make public" : "make private"}
                          </button>
                          <button
                            onClick={() => deleteSeason(season.id)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
                            id={`season-delete-${i}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* INSIGHTS */}
        {tab === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {confirmedInsights.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--mira-flag-green)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Leaf className="w-3 h-3" /> confirmed ({confirmedInsights.length})
                </p>
                <div className="space-y-2">
                  {confirmedInsights.map((insight) => (
                    <div key={insight.id} className="p-4 rounded-2xl bg-[var(--mira-flag-green)]/10 border border-[var(--mira-flag-green)]/30">
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">
                          {insight.kind === "strength" ? "💪" : insight.kind === "pattern" ? "🔄" : "🌱"}
                        </span>
                        <p className="text-sm flex-1">{insight.text}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6 capitalize">{insight.kind}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestedInsights.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--mira-flag-yellow)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Brain className="w-3 h-3" /> suggested by Mira ({suggestedInsights.length}) — tap to confirm or dismiss
                </p>
                <div className="space-y-2">
                  {suggestedInsights.map((insight) => (
                    <div key={insight.id} className="p-4 rounded-2xl bg-card border border-border">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-sm mt-0.5">
                          {insight.kind === "strength" ? "💪" : insight.kind === "pattern" ? "🔄" : "🌱"}
                        </span>
                        <p className="text-sm flex-1">{insight.text}</p>
                      </div>
                      <div className="flex gap-2 ml-6">
                        <button
                          id={`confirm-insight-${insight.id}`}
                          onClick={() => updateInsightStatus(insight.id, "confirmed")}
                          className="text-xs px-3 py-1.5 rounded-xl bg-[var(--mira-flag-green)]/15 text-[var(--mira-flag-green)] border border-[var(--mira-flag-green)]/30 hover:bg-[var(--mira-flag-green)]/25 transition-all font-medium"
                        >
                          ✓ yes, that&apos;s me
                        </button>
                        <button
                          id={`dismiss-insight-${insight.id}`}
                          onClick={() => updateInsightStatus(insight.id, "dismissed")}
                          className="text-xs px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/70 transition-all"
                        >
                          nah, not really
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {localInsights.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">no insights yet. chat with Mira to start building your picture.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* JOURNAL */}
        {tab === "journal" && (
          <motion.div
            key="journal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {journalEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookHeart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">no journal entries yet. coming in a future phase!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      {entry.mood && <span className="text-lg">{entry.mood}</span>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{entry.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Danger zone */}
      <div className="mt-10 pt-6 border-t border-border">
        <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3">danger zone</p>
        <button
          id="delete-everything-btn"
          onClick={deleteEverything}
          className="w-full py-3 rounded-2xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-all"
        >
          🗑️ delete everything &amp; sign out
        </button>
      </div>
    </div>
  );
}
