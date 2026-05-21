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
    case "Go":
      return generateGoStructs("RootPayload", value);
    case "Python":
      return generatePythonDataclasses("RootPayload", value);
    case "Rust":
      return generateRustStructs("RootPayload", value);
    case "C#":
      return generateCSharpClasses("RootPayload", value);
    case "Java":
      return generateJavaClasses("RootPayload", value);
    case "CSV":
      return generateCsvOutput(value);
    case "YAML":
      return toYaml(value);
    case "XML":
      return generateXmlOutput(value);
    case "Schema":
      return JSON.stringify(generateJsonSchema(value), null, 2);
    case "Prisma":
      return generatePrismaModel("payloadaRecord", value);
    case "Mongoose":
      return generateMongooseSchema("payloadaRecord", value);
    default:
      return "";
  }
}

// BUG-004: keys that aren't valid JS identifiers must be quoted in TS/Zod output
const JS_RESERVED = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "export", "extends", "false", "finally", "for",
  "function", "if", "import", "in", "instanceof", "let", "new", "null",
  "return", "static", "super", "switch", "this", "throw", "true", "try",
  "typeof", "var", "void", "while", "with", "yield",
]);

function quoteKeyIfNeeded(key: string): string {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) && !JS_RESERVED.has(key)) {
    return key;
  }
  return `"${key.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
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
        .map(([key, child]) => `${nextIndent}${quoteKeyIfNeeded(key)}: ${toTypeScriptShape(child, depth + 1)};`)
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
        .map(([key, child]) => `${nextIndent}${quoteKeyIfNeeded(key)}: ${toZodShape(child, depth + 1)},`)
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

// BUG-005: sentinel prefix so the converter UI can render this as an info notice
export const CSV_ERROR_PREFIX = "// CSV_ERROR: ";

function generateCsvOutput(value: JsonValue) {
  if (!Array.isArray(value)) {
    const actualType = value === null ? "null" : typeof value;
    return `${CSV_ERROR_PREFIX}CSV requires an array of objects as input, but got ${actualType}.\nWrap your data in an array: [{ ... }]`;
  }

  const rows = value.filter(
    (item): item is Record<string, JsonValue> =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );

  if (rows.length === 0) {
    return `${CSV_ERROR_PREFIX}CSV requires an array of objects, but this array contains no plain objects (found ${value.length} item${value.length === 1 ? "" : "s"}).`;
  }

  if (rows.length !== value.length) {
    return `${CSV_ERROR_PREFIX}CSV requires every item to be a plain object. Some items in this array are primitives or nested arrays — remove them first.`;
  }

  return Papa.unparse(rows);
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

function toPascalCase(str: string): string {
  const parts = str.split(/[^A-Za-z0-9]+/);
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("") || "Field";
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .toLowerCase() || "field";
}

function generateGoStructs(name: string, value: JsonValue): string {
  const structs: string[] = [];
  const structNamesUsed = new Set<string>();

  function makeUniqueName(base: string): string {
    const clean = toPascalCase(base);
    if (!structNamesUsed.has(clean)) {
      structNamesUsed.add(clean);
      return clean;
    }
    let suffix = 2;
    while (structNamesUsed.has(clean + suffix)) {
      suffix++;
    }
    const finalName = clean + suffix;
    structNamesUsed.add(finalName);
    return finalName;
  }

  function walk(currentName: string, val: JsonValue): string {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return "[]interface{}";
      }
      return `[]${walk(currentName, val[0])}`;
    }

    if (val === null) {
      return "interface{}";
    }

    switch (typeof val) {
      case "string":
        return "string";
      case "number":
        return Number.isInteger(val) ? "int64" : "float64";
      case "boolean":
        return "bool";
      case "object": {
        const uniqueName = makeUniqueName(currentName);
        const entries = Object.entries(val);
        const fields = entries
          .map(([key, child]) => {
            const pascalKey = toPascalCase(key);
            const childGoType = walk(pascalKey, child);
            return `\t${pascalKey} ${childGoType} \`json:"${key}"\``;
          })
          .join("\n");

        structs.push(`type ${uniqueName} struct {\n${fields}\n}`);
        return uniqueName;
      }
      default:
        return "interface{}";
    }
  }

  const rootTypeName = walk(name, value);
  if (Array.isArray(value)) {
    return [
      `type ${name} ${rootTypeName}`,
      "",
      ...structs.reverse(),
    ].join("\n\n").trim() + "\n";
  }

  return structs.reverse().join("\n\n").trim() + "\n";
}

function generatePythonDataclasses(name: string, value: JsonValue): string {
  const classes: string[] = [];
  const classNamesUsed = new Set<string>();

  function makeUniqueName(base: string): string {
    const clean = toPascalCase(base);
    if (!classNamesUsed.has(clean)) {
      classNamesUsed.add(clean);
      return clean;
    }
    let suffix = 2;
    while (classNamesUsed.has(clean + suffix)) {
      suffix++;
    }
    const finalName = clean + suffix;
    classNamesUsed.add(finalName);
    return finalName;
  }

  function walk(currentName: string, val: JsonValue): string {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return "List[Any]";
      }
      return `List[${walk(currentName, val[0])}]`;
    }

    if (val === null) {
      return "Optional[Any]";
    }

    switch (typeof val) {
      case "string":
        return "str";
      case "number":
        return Number.isInteger(val) ? "int" : "float";
      case "boolean":
        return "bool";
      case "object": {
        const uniqueName = makeUniqueName(currentName);
        const entries = Object.entries(val);
        const fields = entries
          .map(([key, child]) => {
            const snakeKey = toSnakeCase(key);
            const childPyType = walk(toPascalCase(key), child);
            return `    ${snakeKey}: ${childPyType}`;
          })
          .join("\n");

        classes.push(`@dataclass\nclass ${uniqueName}:\n${fields || "    pass"}`);
        return uniqueName;
      }
      default:
        return "Any";
    }
  }

  const rootTypeName = walk(name, value);
  const header = "from dataclasses import dataclass\nfrom typing import List, Optional, Any\n\n";

  if (Array.isArray(value)) {
    return (
      header +
      classes.join("\n\n").trim() +
      `\n\n# Root payload type alias\n${name} = ${rootTypeName}\n`
    );
  }

  return header + classes.join("\n\n").trim() + "\n";
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1) || "field";
}

function generateRustStructs(name: string, value: JsonValue): string {
  const structs: string[] = [];
  const structNamesUsed = new Set<string>();

  function makeUniqueName(base: string): string {
    const clean = toPascalCase(base);
    if (!structNamesUsed.has(clean)) {
      structNamesUsed.add(clean);
      return clean;
    }
    let suffix = 2;
    while (structNamesUsed.has(clean + suffix)) {
      suffix++;
    }
    const finalName = clean + suffix;
    structNamesUsed.add(finalName);
    return finalName;
  }

  function walk(currentName: string, val: JsonValue): string {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return "Vec<serde_json::Value>";
      }
      return `Vec<${walk(currentName, val[0])}>`;
    }

    if (val === null) {
      return "Option<serde_json::Value>";
    }

    switch (typeof val) {
      case "string":
        return "String";
      case "number":
        return Number.isInteger(val) ? "i64" : "f64";
      case "boolean":
        return "bool";
      case "object": {
        const uniqueName = makeUniqueName(currentName);
        const entries = Object.entries(val);
        const fields = entries
          .map(([key, child]) => {
            const snakeKey = toSnakeCase(key);
            const childRustType = walk(toPascalCase(key), child);
            const renameAttr = snakeKey !== key ? `#[serde(rename = "${key}")]\n    ` : "";
            return `    ${renameAttr}pub ${snakeKey}: ${childRustType},`;
          })
          .join("\n");

        structs.push(`#[derive(Serialize, Deserialize, Debug)]\npub struct ${uniqueName} {\n${fields}\n}`);
        return uniqueName;
      }
      default:
        return "serde_json::Value";
    }
  }

  const rootTypeName = walk(name, value);
  const header = "use serde::{Serialize, Deserialize};\n\n";

  if (Array.isArray(value)) {
    return (
      header +
      structs.reverse().join("\n\n").trim() +
      `\n\npub type ${name} = ${rootTypeName};\n`
    );
  }

  return header + structs.reverse().join("\n\n").trim() + "\n";
}

function generateCSharpClasses(name: string, value: JsonValue): string {
  const classes: string[] = [];
  const classNamesUsed = new Set<string>();

  function makeUniqueName(base: string): string {
    const clean = toPascalCase(base);
    if (!classNamesUsed.has(clean)) {
      classNamesUsed.add(clean);
      return clean;
    }
    let suffix = 2;
    while (classNamesUsed.has(clean + suffix)) {
      suffix++;
    }
    const finalName = clean + suffix;
    classNamesUsed.add(finalName);
    return finalName;
  }

  function walk(currentName: string, val: JsonValue): string {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return "List<object>";
      }
      return `List<${walk(currentName, val[0])}>`;
    }

    if (val === null) {
      return "object";
    }

    switch (typeof val) {
      case "string":
        return "string";
      case "number":
        return Number.isInteger(val) ? "long" : "double";
      case "boolean":
        return "bool";
      case "object": {
        const uniqueName = makeUniqueName(currentName);
        const entries = Object.entries(val);
        const properties = entries
          .map(([key, child]) => {
            const pascalKey = toPascalCase(key);
            const childCSharpType = walk(pascalKey, child);
            return `    [JsonPropertyName("${key}")]\n    public ${childCSharpType} ${pascalKey} { get; set; }`;
          })
          .join("\n\n");

        classes.push(`public class ${uniqueName}\n{\n${properties}\n}`);
        return uniqueName;
      }
      default:
        return "object";
    }
  }

  const rootTypeName = walk(name, value);
  const header = "using System.Collections.Generic;\nusing System.Text.Json.Serialization;\n\n";

  if (Array.isArray(value)) {
    return (
      header +
      classes.reverse().join("\n\n").trim() +
      `\n\n// Root payload type alias\n// using ${name} = ${rootTypeName};\n`
    );
  }

  return header + classes.reverse().join("\n\n").trim() + "\n";
}

function generateJavaClasses(name: string, value: JsonValue): string {
  const classes: string[] = [];
  const classNamesUsed = new Set<string>();

  function makeUniqueName(base: string): string {
    const clean = toPascalCase(base);
    if (!classNamesUsed.has(clean)) {
      classNamesUsed.add(clean);
      return clean;
    }
    let suffix = 2;
    while (classNamesUsed.has(clean + suffix)) {
      suffix++;
    }
    const finalName = clean + suffix;
    classNamesUsed.add(finalName);
    return finalName;
  }

  function walk(currentName: string, val: JsonValue): string {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return "List<Object>";
      }
      return `List<${walk(currentName, val[0])}>`;
    }

    if (val === null) {
      return "Object";
    }

    switch (typeof val) {
      case "string":
        return "String";
      case "number":
        return Number.isInteger(val) ? "Long" : "Double";
      case "boolean":
        return "Boolean";
      case "object": {
        const uniqueName = makeUniqueName(currentName);
        const entries = Object.entries(val);
        const fields = entries
          .map(([key, child]) => {
            const camelKey = toCamelCase(key);
            const pascalKey = toPascalCase(key);
            const childJavaType = walk(pascalKey, child);
            return `    @JsonProperty("${key}")\n    private ${childJavaType} ${camelKey};\n\n    public ${childJavaType} get${pascalKey}() { return this.${camelKey}; }\n    public void set${pascalKey}(${childJavaType} value) { this.${camelKey} = value; }`;
          })
          .join("\n\n");

        classes.push(`public static class ${uniqueName} {\n${fields}\n}`);
        return uniqueName;
      }
      default:
        return "Object";
    }
  }

  const rootTypeName = walk(name, value);
  const header = "import com.fasterxml.jackson.annotation.JsonProperty;\nimport java.util.List;\n\n";

  if (Array.isArray(value)) {
    return (
      header +
      classes.reverse().join("\n\n").trim() +
      `\n\n// Root payload type alias\n// type ${name} = ${rootTypeName};\n`
    );
  }

  return header + classes.reverse().join("\n\n").trim() + "\n";
}
