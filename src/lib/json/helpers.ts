import type { JsonValue } from "@/types/json";
import { generateJsonSchema } from "../converters/schema";

/**
 * Generates an Axios fetch snippet.
 */
export function generateAxiosSnippet(): string {
  return `import axios from "axios";\n\nexport async function fetchUsers() {\n  const response = await axios.get<RootPayload>("/api/users");\n  return response.data;\n}`;
}

/**
 * Generates a React Query hook snippet.
 */
export function generateReactQuerySnippet(): string {
  return `import { useQuery } from "@tanstack/react-query";\n\nexport function useUsers() {\n  return useQuery({\n    queryKey: ["users"],\n    queryFn: fetchUsers,\n  });\n}`;
}

/**
 * Generates an OpenAPI schema snippet.
 */
export function generateOpenApiSnippet(value: JsonValue): string {
  const schema = JSON.stringify(generateJsonSchema(value), null, 2);
  return `components:\n  schemas:\n    RootPayload: ${schema.replace(/\n/g, "\n      ")}`;
}

/**
 * Scans a JSON structure for potential data quality warnings.
 */
export function collectWarnings(value: JsonValue): Array<{ path: string }> {
  const warnings: Array<{ path: string }> = [];

  const visit = (current: JsonValue, path: string) => {
    if (typeof current === "string" && /^\d+(\.\d+)?$/.test(current)) {
      warnings.push({ path });
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, appendPath(path, index)));
      return;
    }

    if (current !== null && typeof current === "object") {
      Object.entries(current).forEach(([key, child]) => visit(child, appendPath(path, key)));
    }
  };

  visit(value, "$");
  return warnings;
}

function appendPath(parent: string, segment: string | number) {
  if (typeof segment === "number") {
    return `${parent}[${segment}]`;
  }

  return parent === "$" ? `$.${segment}` : `${parent}.${segment}`;
}
