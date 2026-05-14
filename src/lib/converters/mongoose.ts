import type { JsonValue } from "@/types/json";

/**
 * Generates a Mongoose schema string from a JSON value.
 */
export function generateMongooseSchema(name: string, value: JsonValue): string {
  return `import { Schema, model } from "mongoose";\n\nconst ${name}Schema = new Schema(${toMongooseShape(
    value,
    0,
  )});\n\nexport const ${name} = model("${name}", ${name}Schema);\n`;
}

function toMongooseShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    const first = value[0] ?? null;
    return `[${toMongooseShape(first, depth)}]`;
  }

  if (value === null) {
    return "Schema.Types.Mixed";
  }

  switch (typeof value) {
    case "string":
      return "String";
    case "number":
      return "Number";
    case "boolean":
      return "Boolean";
    case "object":
      return `{\n${Object.entries(value)
        .map(
          ([key, child]) =>
            `${nextIndent}${quoteKeyIfNeeded(key)}: ${toMongooseShape(child, depth + 1)},`,
        )
        .join("\n")}\n${indent}}`;
    default:
      return "Schema.Types.Mixed";
  }
}

function quoteKeyIfNeeded(key: string) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}
