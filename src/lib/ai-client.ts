export async function callGemini({ prompt, maxTokens = 1500 }: { prompt: string; maxTokens?: number }) {
  const key = process.env.GEMINI_API_KEY;
  const url = process.env.GEMINI_API_URL || "https://api.gemini.example/v1/generate";

  if (!key) {
    throw new Error("GEMINI_API_KEY not configured in environment");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ prompt, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  // NOTE: adapt these fields for the real Gemini response shape
  const result = data.output_text || data.output || data.result || JSON.stringify(data);
  const tokensUsed = data.usage?.total_tokens || data.usage?.total || 0;
  return { result, tokensUsed };
}
