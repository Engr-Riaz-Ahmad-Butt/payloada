import type { JsonValue } from "@/types/json";
import type { EditorStats } from "@/types/workspace";

/**
 * Computes various metrics for a JSON payload.
 * @param source The raw string representation of the JSON.
 * @param value The parsed JSON object/array.
 * @returns An EditorStats object containing computed metrics.
 */
export function computeEditorStats(source: string, value?: JsonValue): EditorStats {
  const stats: EditorStats = {
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
    lineCount: source ? source.split(/\r?\n/).length : 0,
    wordCount: source ? source.trim().split(/\s+/).length : 0,
  };

  if (value !== undefined) {
    walk(value, 1, stats);
  }

  return stats;
}

function walk(value: JsonValue, depth: number, stats: EditorStats) {
  stats.maxDepth = Math.max(stats.maxDepth, depth);

  if (Array.isArray(value)) {
    stats.arrays += 1;
    value.forEach((item) => walk(item, depth + 1, stats));
    return;
  }

  if (value !== null && typeof value === "object") {
    stats.objects += 1;
    const entries = Object.entries(value);
    stats.keys += entries.length;
    entries.forEach(([key, child]) => {
      if (isSensitiveKey(key)) {
        stats.sensitiveFields += 1;
      }
      walk(child, depth + 1, stats);
    });
    return;
  }

  stats.primitives += 1;

  if (value === null) {
    stats.nulls += 1;
    return;
  }

  switch (typeof value) {
    case "string":
      stats.strings += 1;
      break;
    case "number":
      stats.numbers += 1;
      break;
    case "boolean":
      stats.booleans += 1;
      break;
    default:
      break;
  }
}

function isSensitiveKey(key: string): boolean {
  return /(password|token|secret|api[_-]?key|authorization|session|cookie|client_secret)/i.test(
    key,
  );
}

/**
 * Formats a byte count into a human-readable string (e.g., "1.2 KB").
 * @param bytes The number of bytes.
 * @returns A formatted string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
