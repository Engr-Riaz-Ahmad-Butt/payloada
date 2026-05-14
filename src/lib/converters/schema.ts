import type { JsonValue } from "@/types/json";

/**
 * Generates a JSON Schema object from a JSON value.
 */
export function generateJsonSchema(value: JsonValue): Record<string, unknown> {
  if (Array.isArray(value)) {
    return {
      type: "array",
      items: value[0] ? generateJsonSchema(value[0]) : {},
    };
  }

  if (value === null) {
    return { type: "null" };
  }

  if (typeof value === "object") {
    return {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, generateJsonSchema(child)]),
      ),
      required: Object.keys(value),
    };
  }

  return { type: typeof value };
}
