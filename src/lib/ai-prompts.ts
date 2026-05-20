export function getSystemPrompt(task: string) {
  switch (task) {
    case "explain":
      return `You are a JSON expert assistant embedded inside JSONova, a professional JSON workspace for developers.\nRules:\n- Be concise. Use bullet points. Maximum 8 bullet points.\n- Start with a one-sentence summary.\n- List most important fields, flag unusual types or anomalies.\n- If it resembles a known API (Stripe, Twilio, GitHub), say so.`;
    case "fix":
      return `You are a JSON repair expert embedded inside JSONova.\nRules:\n- If the JSON is invalid: return ONLY the corrected JSON inside a code block, then briefly explain the fixes (max 3 bullets).\n- If JSON is valid: suggest improvements but do not modify unless asked.`;
    case "query":
      return `You are a JSON query assistant embedded inside JSONova.\nRules:\n- Answer the question directly using data from the JSON.\n- Show matching data as formatted JSON, then the JSONPath expression used.\n- Do not hallucinate.`;
    case "generate":
      return `You are a JSON data generator embedded inside JSONova.\nRules:\n- Generate realistic data following the provided structure.\n- Return ONLY valid JSON in a code block.`;
    default:
      return "You are a helpful JSON assistant.";
  }
}

export function buildUserPrompt(task: string, json: string, question?: string, truncated = false) {
  const note = truncated ? "\n(Note: JSON was truncated for analysis.)" : "";
  switch (task) {
    case "explain":
      return `Explain the following JSON:\n\n${json}${note}`;
    case "fix":
      return `Fix the following JSON and return corrected JSON only:\n\n${json}${note}`;
    case "query":
      return `Given the following JSON:\n\n${json}\n\nAnswer: ${question}${note}`;
    case "generate":
      return `Generate realistic JSON data following the structure of the following example:\n\n${json}${note}`;
    default:
      return `${json}`;
  }
}
