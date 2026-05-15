import type { JsonValue } from "@/types/json";

/**
 * Generates a Prisma model string from a JSON value.
 */
export function generatePrismaModel(name: string, value: JsonValue): string {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    return `model ${name} {\n  id String @id @default(cuid())\n  payload Json\n}`;
  }

  const fields = Object.entries(value)
    .map(([key, child]) => `  ${sanitizeFieldName(key)} ${toPrismaType(child)}`)
    .join("\n");

  return `model ${name} {\n  id String @id @default(cuid())\n${fields}\n}`;
}

function toPrismaType(value: JsonValue): string {
  if (Array.isArray(value)) {
    return "Json";
  }

  if (value === null) {
    return "Json?";
  }

  switch (typeof value) {
    case "string":
      return "String";
    case "number":
      return Number.isInteger(value) ? "Int" : "Float";
    case "boolean":
      return "Boolean";
    case "object":
      return "Json";
    default:
      return "Json";
  }
}

function sanitizeFieldName(key: string): string {
  return key.replace(/[^A-Za-z0-9_]/g, "_");
}
