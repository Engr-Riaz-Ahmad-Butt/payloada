import { XMLBuilder } from "fast-xml-parser";
import Papa from "papaparse";
import { stringify as toYaml } from "yaml";

import type { ConverterTab, JsonValue } from "../core/types";

export function getConverterOutput(tab: ConverterTab, value: JsonValue | null) {
  if (!value) {
    return "";
  }

  switch (tab) {
    case "TypeScript":
      return generateTypeScript("RootPayload", value);
    case "Zod":
      return generateZodSchema("rootPayloadSchema", value);
    case "CSV":
      return generateCsvOutput(value);
    case "YAML":
      return toYaml(value);
    case "XML":
      return generateXmlOutput(value);
    case "Schema":
      return JSON.stringify(generateJsonSchema(value), null, 2);
    case "Prisma":
      return generatePrismaModel("jsonovaRecord", value);
    case "Mongoose":
      return generateMongooseSchema("jsonovaRecord", value);
    default:
      return "";
  }
}

function generateTypeScript(name: string, value: JsonValue) {
  return `export interface ${name} ${toTypeScriptShape(value, 0)}\n`;
}

function toTypeScriptShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    if (!value.length) {
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
        .map(([key, child]) => `${nextIndent}${key}: ${toTypeScriptShape(child, depth + 1)};`)
        .join("\n")}\n${indent}}`;
    default:
      return "unknown";
  }
}

function generateZodSchema(name: string, value: JsonValue) {
  return `import { z } from "zod";\n\nexport const ${name} = ${toZodShape(value, 0)};\n`;
}

function toZodShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    return `z.array(${toZodShape(value[0] ?? null, depth)})`;
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
        .map(([key, child]) => `${nextIndent}${key}: ${toZodShape(child, depth + 1)},`)
        .join("\n")}\n${indent}})`;
    default:
      return "z.unknown()";
  }
}

function generateJsonSchema(value: JsonValue): Record<string, unknown> {
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

function generateCsvOutput(value: JsonValue) {
  if (!Array.isArray(value)) {
    return "";
  }

  const rows = value.filter(
    (item): item is Record<string, JsonValue> =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );

  return rows.length === value.length ? Papa.unparse(rows) : "";
}

function generateXmlOutput(value: JsonValue) {
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
  });

  return builder.build({ root: value });
}

function generatePrismaModel(name: string, value: JsonValue) {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    return `model ${name} {\n  id String @id @default(cuid())\n  payload Json\n}`;
  }

  const fields = Object.entries(value)
    .map(([key, child]) => `  ${sanitizeFieldName(key)} ${toPrismaType(child)}`)
    .join("\n");

  return `model ${name} {\n  id String @id @default(cuid())\n${fields}\n}`;
}

function generateMongooseSchema(name: string, value: JsonValue) {
  return `import { Schema, model } from "mongoose";\n\nconst ${name}Schema = new Schema(${toMongooseShape(
    value,
    0,
  )});\n\nexport const ${name} = model("${name}", ${name}Schema);\n`;
}

function toPrismaType(value: JsonValue) {
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

function toMongooseShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    return `[${toMongooseShape(value[0] ?? null, depth)}]`;
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
        .map(([key, child]) => `${nextIndent}${key}: ${toMongooseShape(child, depth + 1)},`)
        .join("\n")}\n${indent}}`;
    default:
      return "Schema.Types.Mixed";
  }
}

function sanitizeFieldName(key: string) {
  return key.replace(/[^A-Za-z0-9_]/g, "_");
}
