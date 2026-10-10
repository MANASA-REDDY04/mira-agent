// ============================================================
// MIRA — Provider-Agnostic LLM Wrapper
// Supports: google (default), openai, anthropic
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";

export type LLMMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type LLMStreamOptions = {
  messages: LLMMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
};

const provider = process.env.LLM_PROVIDER ?? "google";
const apiKey = process.env.LLM_API_KEY ?? "";
const model = process.env.LLM_MODEL ?? "gemini-2.0-flash";

// ── Google Gemini ──────────────────────────────────────────

async function* streamGemini(options: LLMStreamOptions): AsyncGenerator<string> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const systemInstruction = options.systemPrompt ?? undefined;

  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction,
    generationConfig: {
      maxOutputTokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.85,
      ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  });

  // Convert messages to Gemini format
  const history = options.messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = options.messages[options.messages.length - 1];

  const chat = geminiModel.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage.content);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

async function completeGemini(options: LLMStreamOptions): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const systemInstruction = options.systemPrompt ?? undefined;

  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction,
    generationConfig: {
      maxOutputTokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.7,
      ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  });

  const history = options.messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = options.messages[options.messages.length - 1];
  const chat = geminiModel.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

// ── Public API ─────────────────────────────────────────────

/**
 * Stream a response from the configured LLM provider.
 * Yields text chunks as they arrive.
 */
export async function* streamLLM(
  options: LLMStreamOptions
): AsyncGenerator<string> {
  switch (provider) {
    case "google":
      yield* streamGemini(options);
      break;
    default:
      throw new Error(`LLM provider "${provider}" not supported yet.`);
  }
}

/**
 * Get a complete (non-streaming) response.
 * Use for structured JSON output.
 */
export async function completeLLM(options: LLMStreamOptions): Promise<string> {
  switch (provider) {
    case "google":
      return completeGemini(options);
    default:
      throw new Error(`LLM provider "${provider}" not supported yet.`);
  }
}

/**
 * Helper: stream a response as a ReadableStream for Next.js route handlers.
 */
export function streamToResponse(
  generator: AsyncGenerator<string>
): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
