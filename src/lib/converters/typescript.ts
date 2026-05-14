import type { JsonValue } from "@/types/json";

/**
 * Generates a TypeScript interface string from a JSON value.
 */
export function generateTypeScript(name: string, value: JsonValue): string {
  return `export interface ${name} ${toTypeScriptShape(value, 0)}\n`;
}

function toTypeScriptShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "unknown[]";
    }
    return `${toTypeScriptShape(value[0], depth)}[]`;
  }

  if (value === null) {
    return "null";
  }

  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return `{\n${Object.entries(value)
        .map(
          ([key, child]) =>
            `${nextIndent}${quoteKeyIfNeeded(key)}: ${toTypeScriptShape(child, depth + 1)};`,
        )
        .join("\n")}\n${indent}}`;
    default:
      return "unknown";
  }
}

function quoteKeyIfNeeded(key: string) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}
