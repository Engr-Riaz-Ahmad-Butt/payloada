import type { JsonValue } from "@/types/json";

const SENSITIVE_KEY_PATTERN =
  /(password|token|secret|api[_-]?key|authorization|client_secret|session|cookie)/i;

/**
 * Scans a JSON value for sensitive fields.
 */
export function collectSensitiveFields(value: JsonValue): Array<{ key: string; path: string }> {
  const fields: Array<{ key: string; path: string }> = [];

  const visit = (current: JsonValue, path: string) => {
    if (current !== null && typeof current === "object" && !Array.isArray(current)) {
      Object.entries(current).forEach(([key, child]) => {
        const nextPath = appendPath(path, key);

        if (SENSITIVE_KEY_PATTERN.test(key)) {
          fields.push({ key, path: nextPath });
        }

        visit(child, nextPath);
      });
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((child, index) => visit(child, appendPath(path, index)));
    }
  };

  visit(value, "$");
  return fields;
}

/**
 * Masks values of sensitive keys in a JSON object.
 */
export function maskSensitiveValues(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(maskSensitiveValues);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? "[masked]" : maskSensitiveValues(child),
      ]),
    );
  }

  return value;
}

function appendPath(parent: string, segment: string | number) {
  if (typeof segment === "number") {
    return `${parent}[${segment}]`;
  }

  return parent === "$" ? `$.${segment}` : `${parent}.${segment}`;
}
