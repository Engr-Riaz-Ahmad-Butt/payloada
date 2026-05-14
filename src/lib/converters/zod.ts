import type { JsonValue } from "@/types/json";

/**
 * Generates a Zod schema string from a JSON value.
 */
export function generateZodSchema(name: string, value: JsonValue): string {
  return `import { z } from "zod";\n\nexport const ${name} = ${toZodShape(value, 0)};\n`;
}

function toZodShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    const child = value.length > 0 ? value[0] : null;
    return `z.array(${toZodShape(child, depth)})`;
  }

  if (value === null) {
    return "z.null()";
  }

  switch (typeof value) {
    case "string":
      return "z.string()";
    case "number":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
    case "object":
      return `z.object({\n${Object.entries(value)
        .map(
          ([key, child]) =>
            `${nextIndent}${quoteKeyIfNeeded(key)}: ${toZodShape(child, depth + 1)},`,
        )
        .join("\n")}\n${indent}})`;
    default:
      return "z.unknown()";
  }
}

function quoteKeyIfNeeded(key: string) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}
