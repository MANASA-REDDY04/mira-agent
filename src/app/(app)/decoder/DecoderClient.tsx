"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Search, Heart, MessageCircle, X, ChevronRight, BookOpen } from "lucide-react";
import type { Term, Archetype } from "@/types/supabase";

interface DecoderClientProps {
  terms: Term[];
  favorites: string[];
  archetypes: Archetype[];
}

const FLAG_COLORS: Record<string, string> = {
  green: "bg-[var(--mira-flag-green)]/15 text-[var(--mira-flag-green)] border-[var(--mira-flag-green)]/30",
  yellow: "bg-[var(--mira-flag-yellow)]/15 text-[var(--mira-flag-yellow)] border-[var(--mira-flag-yellow)]/30",
  red: "bg-[var(--mira-flag-red)]/15 text-[var(--mira-flag-red)] border-[var(--mira-flag-red)]/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

export default function DecoderClient({ terms, favorites: initialFavs, archetypes }: DecoderClientProps) {
  const [tab, setTab] = useState<"dictionary" | "archetypes">("dictionary");
  const [search, setSearch] = useState("");
  const [filterFlag, setFilterFlag] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(initialFavs));
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const supabase = createClient();

  const filteredTerms = useMemo(() => {
    let result = terms;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.includes(q))
      );
    }
    if (filterFlag) result = result.filter((t) => t.flag_rating === filterFlag);
    if (favoritesOnly) result = result.filter((t) => favorites.has(t.id));
    return result;
  }, [terms, search, filterFlag, favoritesOnly, favorites]);

  async function toggleFavorite(termId: string) {
    const isFav = favorites.has(termId);
    const next = new Set(favorites);
    if (isFav) {
      next.delete(termId);
      setFavorites(next);
      await supabase
        .from("term_favorites")
        .delete()
        .eq("term_id", termId);
    } else {
      next.add(termId);
      setFavorites(next);
      await supabase.from("term_favorites").insert({ term_id: termId });
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">The Dictionary 📖</h1>
        <p className="text-sm text-muted-foreground">40+ gen-z dating terms decoded</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-muted mb-4">
        <button
          id="tab-dictionary"
          onClick={() => setTab("dictionary")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "dictionary" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
        >
          📖 Dictionary
        </button>
        <button
          id="tab-archetypes"
          onClick={() => setTab("archetypes")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "archetypes" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
        >
          🃏 Patterns
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "dictionary" && (
          <motion.div
            key="dictionary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="term-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search terms..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--mira-coral)]/50 text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
              {[
                { key: null, label: "all" },
                { key: "green", label: "🟢 green" },
                { key: "yellow", label: "🟡 yellow" },
                { key: "red", label: "🔴 red" },
              ].map((f) => (
                <button
                  key={f.label}
                  onClick={() => setFilterFlag(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                    filterFlag === f.key
                      ? "bg-[var(--mira-coral)] text-white border-transparent"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  favoritesOnly
                    ? "bg-[var(--mira-coral)] text-white border-transparent"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                ❤️ saved
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-3">{filteredTerms.length} terms</p>

            <div className="space-y-2">
              {filteredTerms.map((term) => (
                <motion.div
                  key={term.id}
                  layout
                  id={`term-${term.id}`}
                  onClick={() => setSelectedTerm(term)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-border/50 text-left transition-all group cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{term.term}</span>
                      {term.flag_rating && term.flag_rating !== "neutral" && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${FLAG_COLORS[term.flag_rating]}`}>
                          {term.flag_rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{term.definition}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(term.id); }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      id={`fav-${term.id}`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${favorites.has(term.id) ? "fill-[var(--mira-coral)] text-[var(--mira-coral)]" : "text-muted-foreground"}`}
                      />
                    </button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "archetypes" && (
          <motion.div
            key="archetypes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground mb-4">
              behaviour patterns you might encounter. remember: people are not their patterns.
            </p>
            {archetypes.map((arch) => (
              <button
                key={arch.id}
                id={`archetype-${arch.id}`}
                onClick={() => setSelectedArchetype(arch)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-border/50 text-left transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--mira-coral-light)] to-[var(--mira-lavender-light)] flex items-center justify-center text-2xl flex-shrink-0">
                  {arch.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{arch.name}</p>
                  <p className="text-xs text-muted-foreground">{arch.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Term Detail Sheet */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 space-y-5 max-h-[85dvh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedTerm.term}</h2>
                    {selectedTerm.flag_rating && selectedTerm.flag_rating !== "neutral" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${FLAG_COLORS[selectedTerm.flag_rating]}`}>
                        {selectedTerm.flag_rating} flag
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(selectedTerm.id)}
                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(selectedTerm.id) ? "fill-[var(--mira-coral)] text-[var(--mira-coral)]" : "text-muted-foreground"}`} />
                  </button>
                  <button onClick={() => setSelectedTerm(null)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm leading-relaxed">{selectedTerm.definition}</p>
              </div>

              {selectedTerm.example && (
                <div className="p-4 rounded-2xl bg-[var(--mira-coral-light)] border border-[var(--mira-coral)]/20">
                  <p className="text-xs font-semibold text-[var(--mira-coral)] mb-1">real-life example</p>
                  <p className="text-sm italic">{selectedTerm.example}</p>
                </div>
              )}

              {selectedTerm.how_it_feels && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">how it feels</p>
                  <p className="text-sm">{selectedTerm.how_it_feels}</p>
                </div>
              )}

              {selectedTerm.what_to_do && (
                <div className="p-4 rounded-2xl bg-[var(--mira-lavender-light)] border border-[var(--mira-lavender)]/20">
                  <p className="text-xs font-semibold text-[var(--mira-lavender)] mb-1">what to do</p>
                  <p className="text-sm">{selectedTerm.what_to_do}</p>
                </div>
              )}

              {selectedTerm.indian_context && (
                <div className="p-4 rounded-2xl bg-muted rounded-2xl">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">🇮🇳 indian context</p>
                  <p className="text-sm">{selectedTerm.indian_context}</p>
                </div>
              )}

              {selectedTerm.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTerm.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <Link
                href={`/chat?term=${selectedTerm.id}&q=tell me more about ${encodeURIComponent(selectedTerm.term)}`}
                id={`ask-mira-${selectedTerm.id}`}
                onClick={() => setSelectedTerm(null)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--mira-coral)] to-[var(--mira-lavender)] text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                ask Mira about {selectedTerm.term}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archetype Detail Sheet */}
      <AnimatePresence>
        {selectedArchetype && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedArchetype(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 space-y-5 max-h-[85dvh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedArchetype.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold">{selectedArchetype.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedArchetype.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedArchetype(null)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {selectedArchetype.how_it_feels && (
                <div className="p-4 rounded-2xl bg-[var(--mira-coral-light)] border border-[var(--mira-coral)]/20">
                  <p className="text-xs font-semibold text-[var(--mira-coral)] mb-1">how it feels</p>
                  <p className="text-sm">{selectedArchetype.how_it_feels}</p>
                </div>
              )}

              {selectedArchetype.early_signs?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">early signs</p>
                  <ul className="space-y-1.5">
                    {selectedArchetype.early_signs.map((sign, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-[var(--mira-coral)] mt-0.5 flex-shrink-0">•</span>
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedArchetype.green_flags?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--mira-flag-green)] mb-2">green flags in this type</p>
                  <ul className="space-y-1.5">
                    {selectedArchetype.green_flags.map((f, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-[var(--mira-flag-green)]">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedArchetype.red_flags?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--mira-flag-red)] mb-2">red flags</p>
                  <ul className="space-y-1.5">
                    {selectedArchetype.red_flags.map((f, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-[var(--mira-flag-red)]">!</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedArchetype.how_to_respond && (
                <div className="p-4 rounded-2xl bg-[var(--mira-lavender-light)] border border-[var(--mira-lavender)]/20">
                  <p className="text-xs font-semibold text-[var(--mira-lavender)] mb-1">how to respond</p>
                  <p className="text-sm">{selectedArchetype.how_to_respond}</p>
                </div>
              )}

              {selectedArchetype.nuance_note && (
                <div className="p-4 rounded-2xl bg-muted">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">⚡ nuance note</p>
                  <p className="text-sm text-muted-foreground">{selectedArchetype.nuance_note}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
