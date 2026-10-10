import { createClient } from "@/lib/supabase/server";
import { streamLLM, streamToResponse } from "@/lib/llm";
import { NextRequest } from "next/server";

const DYNAMICS_PROMPT = `You are Mira, a witty, warm big-sister-style guide helping Dharshan understand modern relationships.
He is providing you with a dynamic between him and a girl.
Girl's Name/Initials: {girl_name}
Her Behavior: {her_behavior}
His Behavior: {his_behavior}

Provide a structured, honest, and compassionate analysis of this dynamic.
Do NOT be overly formal. Use a warm, slightly Gen-Z, big-sister tone.
Format the output EXACTLY with these sections (using Markdown):

### ⚖️ The Dynamic (Pros & Cons)
[Brief analysis of what's working and what's toxic/unhealthy. Use bullet points.]

### 🔍 Who's at Fault?
[Honest breakdown. Do not just blame her. If Dharshan is being needy, pushy, or overthinking, tell him kindly but firmly.]

### 🛠️ What Needs to Change
[Actionable advice for Dharshan. What should he do next? What boundary does he need to set? How should he shift his mindset?]

### ✨ Mira's Final Take
[1-2 sentences of encouragement or a reality check]`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return new Response("Unauthorized", { status: 401 });

    const { girlName, herBehavior, hisBehavior } = await request.json();

    if (!girlName || !herBehavior || !hisBehavior) {
      return new Response("Missing fields", { status: 400 });
    }

    const systemPrompt = DYNAMICS_PROMPT
      .replace("{girl_name}", girlName)
      .replace("{her_behavior}", herBehavior)
      .replace("{his_behavior}", hisBehavior);

    const stream = streamLLM({
      messages: [{ role: "user", content: "Please analyze this dynamic." }],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return new Response(streamToResponse(stream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Server Error", { status: 500 });
  }
}
