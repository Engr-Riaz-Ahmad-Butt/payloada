import type { JsonParseResult, JsonValue } from "@/types/json";

export function parseJsonSafe(input: string): JsonParseResult {
  try {
    return {
      valid: true,
      data: JSON.parse(input) as JsonValue,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to parse JSON input.";
    const positionMatch = message.match(/position (\d+)/i);
    const position = positionMatch ? Number(positionMatch[1]) : undefined;

    return {
      valid: false,
      error: message,
      ...getLineAndColumn(input, position),
    };
  }
}

function getLineAndColumn(input: string, position?: number) {
  if (position === undefined || Number.isNaN(position)) {
    return {};
  }

  const slice = input.slice(0, position);
  const lines = slice.split("\n");

  return {
    line: lines.length,
    column: lines.at(-1)?.length ? lines.at(-1)!.length + 1 : 1,
  };
}
