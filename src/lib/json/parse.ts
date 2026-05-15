import type { JsonParseResult, JsonValue } from "@/types/json";
import { getFriendlyJsonError } from "./friendly-errors";

export function parseJsonSafe(input: string): JsonParseResult {
  try {
    return {
      valid: true,
      data: JSON.parse(input) as JsonValue,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to parse JSON input.";
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
/**
 * Generates detailed error information for a JSON parsing failure.
 */
export function getErrorDetails(source: string, message: string) {
  const friendly = getFriendlyJsonError(message);
  const lines = source.split(/\r?\n/);
  const trailingCommaLine = lines.find((line) => /,\s*[}\]]/.test(line));

  if (trailingCommaLine) {
    return {
      problem: "You added a comma after the last property.",
      why: "JSON does not allow trailing commas.",
      fix: `Remove the comma after ${extractLastKey(trailingCommaLine)}.`,
    };
  }

  if (/expected property name/i.test(message)) {
    return {
      problem: "A property name is not wrapped in double quotes.",
      why: "JSON requires every object key to use double quotes.",
      fix: 'Wrap the property name in double quotes, for example "email".',
    };
  }

  return {
    problem: message,
    why: friendly,
    fix: "Review the highlighted line for missing quotes, commas, or brackets, then validate again.",
  };
}

function extractLastKey(line: string) {
  const keyMatch = line.match(/"([^"]+)"/g);
  const lastKey = keyMatch?.at(-1)?.replaceAll('"', "");
  return lastKey ? `"${lastKey}"` : "the last field";
}
