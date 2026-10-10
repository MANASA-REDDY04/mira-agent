import { createClient } from "@/lib/supabase/server";
import { buildMiraContext } from "@/lib/context-builder";
import {
  streamLLM,
  streamToResponse,
  type LLMMessage,
} from "@/lib/llm";
import {
  BASE_SYSTEM_PROMPT,
  VIBE_CHECK_PROMPT,
  TEXT_DECODER_PROMPT,
  POST_MORTEM_PROMPT,
  REALITY_CHECK_PROMPT,
  buildMiraPrompt,
} from "@/lib/prompts/mira";
import { NextRequest } from "next/server";

// Basic rate limiting — in-memory, per-deployment (replace with Redis/KV in prod)
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(userId);
  if (!entry || now > entry.reset) {
    rateMap.set(userId, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function getModePromptTemplate(mode: string): string {
  switch (mode) {
    case "vibe_check":
      return VIBE_CHECK_PROMPT;
    case "text_decoder":
      return TEXT_DECODER_PROMPT;
    case "post_mortem":
      return POST_MORTEM_PROMPT;
    case "reality_check":
      return REALITY_CHECK_PROMPT;
    default:
      return BASE_SYSTEM_PROMPT;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        "hold up bestie, you're going a little fast 😅 try again in a minute",
        { status: 429, headers: { "Content-Type": "text/plain" } }
      );
    }

    const body = await request.json();
    const { sessionId, mode, message, history } = body;

    // Input validation
    if (!message || typeof message !== "string") {
      return new Response("invalid message", { status: 400 });
    }
    if (message.length > 2000) {
      return new Response("message too long (max 2000 chars)", { status: 400 });
    }

    // Verify session ownership
    if (sessionId) {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("user_id")
        .eq("id", sessionId)
        .single();
      if (!session || session.user_id !== user.id) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    // Build context
    const { systemContext, miraName, languageMode } = await buildMiraContext(
      user.id,
      sessionId
    );

    // Build system prompt
    const promptTemplate = getModePromptTemplate(mode ?? "chat");
    const systemPrompt = buildMiraPrompt(promptTemplate, {
      mira_name: miraName,
      language_mode: languageMode,
    }) + "\n\n" + systemContext;

    // Build message history
    const llmMessages: LLMMessage[] = [
      ...((history as LLMMessage[]) ?? []).slice(-20),
      { role: "user", content: message },
    ];

    // Stream response
    const stream = streamLLM({
      messages: llmMessages,
      systemPrompt,
      temperature: 0.85,
      maxTokens: 1024,
    });

    return new Response(streamToResponse(stream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return new Response(
      "something went wrong on my end 😬 check your LLM_API_KEY env var.",
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}
