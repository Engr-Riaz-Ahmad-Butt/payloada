import { NextResponse } from "next/server";
import { callGemini } from "@/lib/ai-client";
import { getSystemPrompt, buildUserPrompt } from "@/lib/ai-prompts";
import { consumeRequest } from "@/lib/rate-limiter";

const ALLOWED_TASKS = ["explain", "fix", "query", "generate"] as const;
const MAX_JSON_LENGTH = 50_000;
const TRUNCATE_AT = 20_000;
const MAX_QUESTION_LENGTH = 2000;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { task, json, question } = body;

    if (typeof task !== "string" || !(ALLOWED_TASKS as readonly string[]).includes(task)) {
      return NextResponse.json({ error: "Invalid task type", code: "invalid_input" }, { status: 400 });
    }

    if (typeof json !== "string" || !json.trim()) {
      return NextResponse.json({ error: "No JSON provided", code: "invalid_input" }, { status: 400 });
    }

    if (json.length > MAX_JSON_LENGTH) {
      return NextResponse.json(
        { error: "JSON is too large for AI analysis (max 50KB).", code: "invalid_input" },
        { status: 400 },
      );
    }

    if (question !== undefined && (typeof question !== "string" || question.length > MAX_QUESTION_LENGTH)) {
      return NextResponse.json({ error: "Question is too long (max 2000 chars)", code: "invalid_input" }, { status: 400 });
    }

    // x-real-ip is set by trusted reverse proxies (Vercel, nginx) and cannot be
    // spoofed by the client. x-forwarded-for leftmost value is client-controlled.
    const ip =
      req.headers.get("x-real-ip")?.trim() ||
      req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
      "unknown";

    const rl = await consumeRequest(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Daily limit reached (10 requests). Resets at midnight UTC.", code: "rate_limited" },
        { status: 429 },
      );
    }

    let sentJson = json;
    let truncated = false;
    if (json.length > TRUNCATE_AT) {
      sentJson = `${json.slice(0, 10_000)}\n...[truncated for length]...\n${json.slice(-5_000)}`;
      truncated = true;
    }

    const system = getSystemPrompt(task);
    const prompt = buildUserPrompt(task, sentJson, typeof question === "string" ? question : undefined, truncated);

    const maxTokens = task === "generate" ? 3000 : task === "fix" ? 2000 : 1500;
    const { result, tokensUsed } = await callGemini({ system, prompt, maxTokens });

    return NextResponse.json({ result, tokensUsed, remaining: rl.remaining });
  } catch (err) {
    console.error("[/api/ai]", err);
    if (err instanceof Error && err.message === "rate_limited_upstream") {
      const rateLimitError = err as Error & {
        retryAfter?: number;
        provider?: string;
        model?: string;
        upstreamMessage?: string;
      };
      const seconds = rateLimitError.retryAfter ?? 60;
      return NextResponse.json(
        {
          error: `Gemini rate limit reached. Please wait ${seconds}s and try again.`,
          code: "rate_limited_upstream",
          provider: rateLimitError.provider ?? "gemini",
          model: rateLimitError.model ?? "unknown",
          retryAfter: seconds,
          upstreamMessage: rateLimitError.upstreamMessage ?? "Gemini rate limit reached",
        },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Try again in a moment.", code: "ai_error" },
      { status: 502 },
    );
  }
}
