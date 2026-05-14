import type { JsonStats, JsonValue } from "@/types/json";

export function getJsonStats(value: JsonValue, source: string): JsonStats {
  const stats: JsonStats = {
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

  walk(value, 1, stats);
  return stats;
}

function walk(value: JsonValue, depth: number, stats: JsonStats) {
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

function isSensitiveKey(key: string) {
  return /(password|token|secret|api[_-]?key|authorization|session|cookie)/i.test(key);
}
