export type ConverterId =
  | "typescript"
  | "zod"
  | "csv"
  | "yaml"
  | "json-schema";

export const plannedConverters: Record<ConverterId, string> = {
  typescript: "Generate TypeScript interfaces from JSON samples.",
  zod: "Generate runtime validation schemas for modern TypeScript apps.",
  csv: "Flatten arrays of objects into spreadsheet-friendly CSV output.",
  yaml: "Convert valid JSON into YAML for config and DevOps workflows.",
  "json-schema": "Infer a JSON Schema contract from example payloads.",
};
