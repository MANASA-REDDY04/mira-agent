"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Sparkles, AlertCircle } from "lucide-react";

export default function DynamicsPage() {
  const [girlName, setGirlName] = useState("");
  const [herBehavior, setHerBehavior] = useState("");
  const [hisBehavior, setHisBehavior] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!girlName.trim() || !herBehavior.trim() || !hisBehavior.trim()) {
      setError("Please fill out all fields bestie!");
      return;
    }
    setError("");
    setLoading(true);
    setAnalysis("");

    try {
      const res = await fetch("/api/dynamics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ girlName, herBehavior, hisBehavior }),
      });

      if (!res.ok) throw new Error("Failed to get analysis");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
          setAnalysis(fullContent);
        }
      }
    } catch (err) {
      setError("Something went wrong calculating the vibe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto pb-20">
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 border-b border-border/50 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--mira-coral)] to-[var(--mira-lavender)] flex items-center justify-center text-white">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold">Dynamics Analyzer</h1>
          <p className="text-xs text-muted-foreground">see who's really at fault</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {!analysis && !loading ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-sm font-medium mb-1">Who is this about?</p>
              <input
                value={girlName}
                onChange={(e) => setGirlName(e.target.value)}
                placeholder="Name or initials..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mira-coral)]/50"
              />
            </div>
            
            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-sm font-medium mb-1">Her Behavior</p>
              <p className="text-xs text-muted-foreground mb-2">What does she do? How does she act around you?</p>
              <textarea
                value={herBehavior}
                onChange={(e) => setHerBehavior(e.target.value)}
                rows={4}
                placeholder="e.g. She texts me everyday but flakes when we make plans..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--mira-coral)]/50"
              />
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-sm font-medium mb-1">Your Behavior</p>
              <p className="text-xs text-muted-foreground mb-2">Be honest. How do you react? What do you do?</p>
              <textarea
                value={hisBehavior}
                onChange={(e) => setHisBehavior(e.target.value)}
                rows={4}
                placeholder="e.g. I wait all day for her texts and always forgive her for flaking..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--mira-coral)]/50"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[var(--mira-flag-red)] text-sm p-3 bg-[var(--mira-flag-red)]/10 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--mira-coral)] to-[var(--mira-lavender)] text-white font-bold shadow-lg shadow-[var(--mira-coral)]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyze Dynamic
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div className="p-5 rounded-2xl bg-card border border-border prose prose-sm dark:prose-invert max-w-none">
                {(!analysis && loading) ? "Analyzing... 🔮" : analysis.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-[var(--mira-coral)]">{trimmed.replace('### ', '')}</h3>;
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const content = trimmed.substring(2);
                    if (content.includes('**')) {
                      const parts = content.split('**');
                      return <li key={i} className="ml-4 mb-1 list-disc">{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</li>;
                    }
                    return <li key={i} className="ml-4 mb-1 list-disc">{content}</li>;
                  }
                  if (trimmed === '---') return <hr key={i} className="my-4 border-border/50" />;
                  if (trimmed === '') return <br key={i} />;
                  
                  if (trimmed.includes('**')) {
                    const parts = trimmed.split('**');
                    return <p key={i} className="mb-2">{parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-foreground">{p}</strong> : p)}</p>;
                  }
                  return <p key={i} className="mb-2">{trimmed}</p>;
                })}
             </div>
             
             {!loading && (
               <button
                 onClick={() => {
                   setAnalysis("");
                   setGirlName("");
                   setHerBehavior("");
                   setHisBehavior("");
                 }}
                 className="w-full py-3 rounded-xl border border-border bg-card font-medium hover:bg-muted/50 transition-colors"
               >
                 Analyze Another Dynamic
               </button>
             )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
