import { NextResponse } from "next/server";
import { callGemini } from "@/lib/ai-client";
import { getSystemPrompt, buildUserPrompt } from "@/lib/ai-prompts";
import { consumeRequest } from "@/lib/rate-limiter";

const MAX_JSON = 50_000;
const TRUNCATE_THRESHOLD = 20_000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { task, json, question } = body || {};

    const allowedTasks = ["explain", "fix", "query", "generate"];
    if (!allowedTasks.includes(task)) {
      return NextResponse.json({ error: "Invalid task", code: "invalid_input" }, { status: 400 });
    }

    if (typeof json !== "string" || !json.trim()) {
      return NextResponse.json({ error: "No JSON provided", code: "invalid_input" }, { status: 400 });
    }

    if (json.length > MAX_JSON) {
      return NextResponse.json({ error: "Your JSON is too large for AI analysis (max 50KB).", code: "invalid_input" }, { status: 400 });
    }

    if (question && typeof question === "string" && question.length > 500) {
      return NextResponse.json({ error: "Question too long", code: "invalid_input" }, { status: 400 });
    }

    // Rate limit
    const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").toString().split(",")[0].trim();
    const rl = consumeRequest(ip);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Daily limit reached (10 requests). Resets at midnight UTC.", code: "rate_limited" }, { status: 429 });
    }

    // Possibly truncate for very large payloads
    let sentJson = json;
    let truncated = false;
    if (json.length > TRUNCATE_THRESHOLD) {
      const head = json.slice(0, 10000);
      const tail = json.slice(-5000);
      sentJson = `${head}\n...[truncated for length]...\n${tail}`;
      truncated = true;
    }

    const systemPrompt = getSystemPrompt(task);
    const userPrompt = buildUserPrompt(task, sentJson, question, truncated);

    const ai = await callGemini({ prompt: systemPrompt + "\n\n" + userPrompt, maxTokens: 1500 });

    return NextResponse.json({ result: ai.result, tokensUsed: ai.tokensUsed || 0 });
  } catch (err) {
    // Log server-side for diagnostics; do not leak sensitive data to clients
    // eslint-disable-next-line no-console
    console.error("/api/ai error", err);
    return NextResponse.json({ error: "AI service error", code: "ai_error" }, { status: 502 });
  }
}
