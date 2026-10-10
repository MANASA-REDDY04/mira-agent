"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Send, Sparkles, ChevronDown } from "lucide-react";

const MODES = [
  { id: "chat", label: "Chat", emoji: "💬", desc: "Talk to Mira freely" },
  { id: "vibe_check", label: "Vibe Check", emoji: "🔍", desc: "Analyse a situation" },
  { id: "text_decoder", label: "Text Decoder", emoji: "🔑", desc: "Decode a message" },
  { id: "post_mortem", label: "Post-Mortem", emoji: "🪞", desc: "Debrief a situation" },
  { id: "reality_check", label: "Reality Check", emoji: "🧊", desc: "Stop the spiral" },
] as const;

type Mode = (typeof MODES)[number]["id"];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// PII warning patterns
const PII_PATTERNS = [
  /\b\d{10}\b/,                         // phone number
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // email
];

function hasPII(text: string) {
  return PII_PATTERNS.some((p) => p.test(text));
}

function parseMessageOptions(content: string) {
  const options: string[] = [];
  const regex = /\[Option:\s*(.*?)\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    options.push(match[1]);
  }
  const cleanContent = content.replace(/\[Option:\s*(.*?)\]/g, "").trim();
  return { cleanContent, options };
}

export default function ChatPage() {
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showModePicker, setShowModePicker] = useState(false);
  const [piiWarning, setPiiWarning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const currentMode = MODES.find((m) => m.id === mode)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setPiiWarning(hasPII(input));
  }, [input]);

  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        mode,
        title: `${currentMode.label} session`,
      })
      .select("id")
      .single();

    if (!data) throw new Error("Failed to create session");
    setSessionId(data.id);
    return data.id;
  }

  async function sendMessage(overrideInput?: string) {
    const textToSend = overrideInput ?? input.trim();
    if (!textToSend || loading) return;
    if (textToSend.length > 2000) {
      alert("Message too long — keep it under 2000 characters.");
      return;
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: textToSend,
      id: crypto.randomUUID(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideInput) {
      setInput("");
    }
    setLoading(true);

    try {
      const sid = await ensureSession();

      // Save user message
      await supabase.from("messages").insert({
        session_id: sid,
        role: "user",
        content: userMsg.content,
      });

      // Stream from API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          mode,
          message: userMsg.content,
          history: messages.slice(-20).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", id: assistantId },
      ]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullContent } : m
            )
          );
        }
      }

      // Save assistant message
      await supabase.from("messages").insert({
        session_id: sid,
        role: "assistant",
        content: fullContent,
      });

      // Increment message count
      try {
        await supabase.rpc("increment_message_count" as never, {
          session_id: sid,
        } as never);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "ugh, something went wrong on my end 😬 try again? if it keeps happening, check that your LLM key is set.",
          id: crypto.randomUUID(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 border-b border-border/50 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--mira-coral)] to-[var(--mira-lavender)] flex items-center justify-center text-xl">
          ✨
        </div>
        <div className="flex-1">
          <h1 className="font-bold">Mira</h1>
          <p className="text-xs text-muted-foreground">your big-sister guide</p>
        </div>

        {/* Mode picker */}
        <div className="relative">
          <button
            id="mode-picker-btn"
            onClick={() => setShowModePicker(!showModePicker)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all"
          >
            <span>{currentMode.emoji}</span>
            <span className="hidden sm:inline">{currentMode.label}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {showModePicker && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-50"
              >
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    id={`mode-${m.id}`}
                    onClick={() => {
                      setMode(m.id);
                      setShowModePicker(false);
                      setMessages([]);
                      setSessionId(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                      mode === m.id ? "bg-[var(--mira-coral)]/10" : ""
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4 animate-bounce-subtle">{currentMode.emoji}</div>
            <h2 className="text-lg font-bold mb-1">{currentMode.label}</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {currentMode.desc}. what&apos;s on your mind?
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {["what&apos;s love-bombing?", "she went cold...", "am I overthinking?"].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s.replace(/&apos;/g, "'"))}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted/50 transition-all"
                >
                  {s.replace(/&apos;/g, "'")}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          const { cleanContent, options } = msg.role === "assistant" 
            ? parseMessageOptions(msg.content)
            : { cleanContent: msg.content, options: [] };

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mira-coral)] to-[var(--mira-lavender)] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    ✨
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[var(--mira-coral)] text-white rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  }`}
                >
                  {cleanContent || (
                    <div className="flex gap-1.5 items-center h-5">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  )}
                </div>
              </div>
              
              {msg.role === "assistant" && options.length > 0 && isLastMessage && !loading && (
                <div className="flex flex-col gap-2 ml-10 mt-1 mb-2">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(opt)}
                      className="text-left px-4 py-2.5 text-sm rounded-xl border border-[var(--mira-coral)]/30 bg-[var(--mira-coral)]/5 hover:bg-[var(--mira-coral)]/15 text-[var(--mira-coral)] transition-colors w-fit font-medium max-w-[85%]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mira-coral)] to-[var(--mira-lavender)] flex items-center justify-center text-sm flex-shrink-0">
              ✨
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border">
              <div className="flex gap-1.5 items-center h-5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-4 border-t border-border/50 pt-3">
        <AnimatePresence>
          {piiWarning && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-[var(--mira-flag-yellow)] mb-2"
            >
              ⚠️ heads up — looks like there might be a phone number or email in your message. keep other people&apos;s details minimal (nickname/initials only).
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex gap-2 items-end">
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={`tell ${currentMode.emoji} what's going on...`}
            maxLength={2000}
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--mira-coral)]/50 resize-none transition-all text-sm min-h-[48px] max-h-[120px]"
          />
          <button
            id="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--mira-coral)] to-[var(--mira-lavender)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-right">
          {input.length}/2000
        </p>
      </div>
    </div>
  );
}
