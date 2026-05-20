const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 30_000;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text: string }>;
    };
  }>;
  usageMetadata?: {
    totalTokenCount?: number;
  };
  error?: {
    message: string;
    status: string;
  };
};

export async function callGemini({
  system,
  prompt,
  maxTokens = 1500,
}: {
  system: string;
  prompt: string;
  maxTokens?: number;
}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
        },
      }),
      signal: controller.signal,
    });

    const data = (await res.json()) as GeminiResponse;

    if (!res.ok) {
      if (res.status === 429) {
        const msg = data.error?.message ?? "";
        const seconds = Math.ceil(parseFloat(msg.match(/[\d.]+(?=s)/)?.[0] ?? "60"));
        throw Object.assign(new Error("rate_limited_upstream"), {
          retryAfter: seconds,
          provider: "gemini",
          model: MODEL,
          upstreamMessage: msg || "Gemini rate limit reached",
          status: res.status,
        });
      }
      throw new Error(`Gemini API error ${res.status}: ${data.error?.message ?? res.statusText}`);
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const tokensUsed = data.usageMetadata?.totalTokenCount ?? 0;
    return { result, tokensUsed };
  } finally {
    clearTimeout(timeoutId);
  }
}
