import type { JsonStats, JsonValue } from "@/types/json";

export function getJsonStats(value: JsonValue, source: string): JsonStats {
  const stats: JsonStats = {
    bytes: new TextEncoder().encode(source).length,
    keys: 0,
    objects: 0,
    arrays: 0,
    primitives: 0,
    maxDepth: 0,
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
    entries.forEach(([, child]) => walk(child, depth + 1, stats));
    return;
  }

  stats.primitives += 1;
}
