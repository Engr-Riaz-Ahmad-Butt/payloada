import type { JsonStats } from "@/types/json";
import { SENSITIVE_FIELDS_REGEX } from "@/constants/app";

import type { JsonValue } from "../core/types";

export function buildIntelligentIssues(value: JsonValue | null) {
  if (!value) {
    return {
      sensitive: null as null | { path: string },
      warning: null as null | string,
    };
  }

  let sensitive: { path: string } | null = null;
  let warning: string | null = null;

  const visit = (current: JsonValue, path: string) => {
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }

    if (current !== null && typeof current === "object") {
      Object.entries(current).forEach(([key, child]) => {
        const nextPath = path === "$" ? `$.${key}` : `${path}.${key}`;

        if (!sensitive && SENSITIVE_FIELDS_REGEX.test(key)) {
          sensitive = { path: nextPath };
        }

        if (!warning && typeof child === "string" && /^\d+(\.\d+)?$/.test(child)) {
          warning = `${nextPath} is a string but looks like a number.`;
        }

        visit(child, nextPath);
      });
    }
  };

  visit(value, "$");
  return { sensitive, warning };
}

export function maskSensitiveValues(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(maskSensitiveValues);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        SENSITIVE_FIELDS_REGEX.test(key)
          ? "[masked]"
          : maskSensitiveValues(child),
      ]),
    );
  }

  return value;
}

export function repairJsonInput(input: string) {
  return input.replace(/,\s*([}\]])/g, "$1");
}

export function emptyStats(source: string): JsonStats {
  return {
    bytes: new TextEncoder().encode(source).length,
    keys: 0,
    objects: 0,
    arrays: 0,
    primitives: 0,
    maxDepth: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    sensitiveFields: 0,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
