import { parseJsonSafe } from "./parse";
import { appendPath } from "./search";
import type { JsonValue } from "@/types/json";
import type { DiffSummary } from "@/types/workspace";

/**
 * Builds a summary of differences between two JSON strings.
 */
export function buildDiffSummary(oldSource: string, newSource: string): DiffSummary | null {
  const oldParsed = parseJsonSafe(oldSource);
  const newParsed = parseJsonSafe(newSource);

  if (!oldParsed.valid || !newParsed.valid) {
    return null;
  }

  const summary: DiffSummary = {
    added: [],
    removed: [],
    changed: [],
    typeChanges: [],
  };

  compareValues("$", oldParsed.data, newParsed.data, summary);
  return summary;
}

function compareValues(
  path: string,
  oldValue: JsonValue,
  newValue: JsonValue,
  summary: DiffSummary,
) {
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const maxLength = Math.max(oldValue.length, newValue.length);
    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = appendPath(path, index);
      if (index >= oldValue.length) {
        summary.added.push(`${nextPath}`);
      } else if (index >= newValue.length) {
        summary.removed.push(`${nextPath}`);
      } else {
        compareValues(nextPath, oldValue[index], newValue[index], summary);
      }
    }
    return;
  }

  if (
    oldValue !== null &&
    newValue !== null &&
    typeof oldValue === "object" &&
    typeof newValue === "object" &&
    !Array.isArray(oldValue) &&
    !Array.isArray(newValue)
  ) {
    const oldValueObj = oldValue as Record<string, JsonValue>;
    const newValueObj = newValue as Record<string, JsonValue>;
    const keys = new Set([...Object.keys(oldValueObj), ...Object.keys(newValueObj)]);

    keys.forEach((key) => {
      const nextPath = appendPath(path, key);
      if (!(key in oldValueObj)) {
        summary.added.push(nextPath);
      } else if (!(key in newValueObj)) {
        summary.removed.push(nextPath);
      } else {
        compareValues(nextPath, oldValueObj[key], newValueObj[key], summary);
      }
    });
    return;
  }

  if (typeof oldValue !== typeof newValue) {
    summary.typeChanges.push(`${path}: ${typeof oldValue} → ${typeof newValue}`);
    return;
  }

  if (oldValue !== newValue) {
    summary.changed.push(`${path}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
  }
}
