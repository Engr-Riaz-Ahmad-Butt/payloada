import { parseJsonSafe } from "@/lib/json";

import type { GraphNodeData, JsonValue } from "../core/types";
import { appendPath, previewValue } from "../editor/json-path-utils";
import type { Edge, Node } from "@xyflow/react";

export function buildDiffSummary(oldSource: string, newSource: string) {
  const oldParsed = parseJsonSafe(oldSource);
  const newParsed = parseJsonSafe(newSource);

  if (!oldParsed.valid || !newParsed.valid) {
    return null;
  }

  const summary = {
    added: [] as string[],
    removed: [] as string[],
    changed: [] as string[],
    typeChanges: [] as string[],
  };

  compareValues("$", oldParsed.data, newParsed.data, summary);
  return summary;
}

function compareValues(
  path: string,
  oldValue: JsonValue,
  newValue: JsonValue,
  summary: {
    added: string[];
    removed: string[];
    changed: string[];
    typeChanges: string[];
  },
) {
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const max = Math.max(oldValue.length, newValue.length);
    for (let index = 0; index < max; index += 1) {
      const nextPath = appendPath(path, index);
      if (index >= oldValue.length) {
        summary.added.push(nextPath);
      } else if (index >= newValue.length) {
        summary.removed.push(nextPath);
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
    const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    keys.forEach((key) => {
      const nextPath = appendPath(path, key);
      if (!(key in oldValue)) {
        summary.added.push(nextPath);
      } else if (!(key in newValue)) {
        summary.removed.push(nextPath);
      } else {
        compareValues(nextPath, oldValue[key], newValue[key], summary);
      }
    });
    return;
  }

  if (typeof oldValue !== typeof newValue) {
    summary.typeChanges.push(`${path}: ${typeof oldValue} -> ${typeof newValue}`);
    return;
  }

  if (oldValue !== newValue) {
    summary.changed.push(`${path}: ${JSON.stringify(oldValue)} -> ${JSON.stringify(newValue)}`);
  }
}

export function buildLineDiff(original: string, modified: string, ignoreWhitespace: boolean) {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");
  const normalize = (line: string) => (ignoreWhitespace ? line.trim() : line);
  const oldValues = originalLines.map(normalize);
  const newValues = modifiedLines.map(normalize);
  const rows = oldValues.length + 1;
  const cols = newValues.length + 1;
  const lcs = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let row = oldValues.length - 1; row >= 0; row -= 1) {
    for (let col = newValues.length - 1; col >= 0; col -= 1) {
      lcs[row][col] =
        oldValues[row] === newValues[col]
          ? lcs[row + 1][col + 1] + 1
          : Math.max(lcs[row + 1][col], lcs[row][col + 1]);
    }
  }

  const removed = new Set<number>();
  const added = new Set<number>();
  let row = 0;
  let col = 0;

  while (row < oldValues.length && col < newValues.length) {
    if (oldValues[row] === newValues[col]) {
      row += 1;
      col += 1;
      continue;
    }

    if (lcs[row + 1][col] >= lcs[row][col + 1]) {
      removed.add(row + 1);
      row += 1;
    } else {
      added.add(col + 1);
      col += 1;
    }
  }

  while (row < oldValues.length) {
    removed.add(row + 1);
    row += 1;
  }

  while (col < newValues.length) {
    added.add(col + 1);
    col += 1;
  }

  return {
    originalLines: Array.from(removed),
    modifiedLines: Array.from(added),
  };
}

export function buildJsonGraph(value: JsonValue) {
  const nodes: Array<Node<GraphNodeData>> = [];
  const edges: Array<Edge> = [];
  const levelY = new Map<number, number>();

  const nextY = (depth: number) => {
    const current = levelY.get(depth) ?? 0;
    levelY.set(depth, current + 110);
    return current;
  };

  const visit = (
    current: JsonValue,
    label: string,
    depth: number,
    id: string,
    parentId?: string,
  ) => {
    const isArray = Array.isArray(current);
    const isObject = current !== null && typeof current === "object" && !isArray;
    const subtitle = isArray
      ? `Array(${current.length})`
      : isObject
      ? `Object(${Object.keys(current).length})`
      : previewValue(current);

    nodes.push({
      id,
      type: "jsonNode",
      position: { x: depth * 230, y: nextY(depth) },
      data: {
        title: label,
        subtitle,
        tone: depth === 0 ? "root" : isArray || isObject ? "container" : "leaf",
      },
      draggable: true,
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${id}`,
        source: parentId,
        target: id,
        style: { stroke: "#3a3939", strokeWidth: 1.25 },
        animated: false,
      });
    }

    if (isArray) {
      current.forEach((item, index) => {
        visit(item, `[${index}]`, depth + 1, `${id}-${index}`, id);
      });
      return;
    }

    if (isObject) {
      Object.entries(current).forEach(([key, child], index) => {
        visit(child, key, depth + 1, `${id}-${index}`, id);
      });
    }
  };

  visit(value, "root", 0, "root");
  return { nodes, edges };
}
