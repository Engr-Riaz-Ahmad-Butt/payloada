import type { JsonValue } from "@/types/json";
import type { SearchMatch, SelectedNode } from "@/types/workspace";

/**
 * Appends a segment to a JSONPath.
 */
export function appendPath(parent: string, segment: string | number): string {
  if (typeof segment === "number") {
    return `${parent}[${segment}]`;
  }

  if (/^[A-Za-z_$][\w$]*$/.test(segment)) {
    return `${parent}.${segment}`;
  }

  return `${parent}[${JSON.stringify(segment)}]`;
}

/**
 * Retrieves a value from a JSON object at a specific path.
 */
export function getValueAtPath(value: JsonValue, path: string): JsonValue | undefined {
  if (path === "$") {
    return value;
  }

  const segments = Array.from(
    path.matchAll(/(?:\.([A-Za-z_$][\w$]*))|\[(\d+|"(?:[^"\\]|\\.)*")\]/g),
  );
  let current: JsonValue = value;

  for (const match of segments) {
    const property = match[1];
    const bracket = match[2];
    const segment = property ?? (bracket?.startsWith('"') ? JSON.parse(bracket) : Number(bracket));

    if (Array.isArray(current) && typeof segment === "number") {
      current = current[segment];
      continue;
    }

    if (current !== null && typeof current === "object" && typeof segment === "string") {
      current = (current as Record<string, JsonValue>)[segment];
      continue;
    }

    return undefined;
  }

  return current;
}

/**
 * Searches for matches within a JSON structure.
 */
export function findSearchMatches(value: JsonValue, term: string): SearchMatch[] {
  const normalizedTerm = term.toLowerCase();
  const matches: SearchMatch[] = [];

  const visit = (current: JsonValue, path: string, keyLabel: string) => {
    const preview = getNodePreview(current);
    const haystacks = [path.toLowerCase(), keyLabel.toLowerCase(), preview.toLowerCase()];

    if (haystacks.some((entry) => entry.includes(normalizedTerm))) {
      matches.push({ path, preview, value: current });
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, appendPath(path, index), `[${index}]`));
      return;
    }

    if (current !== null && typeof current === "object") {
      Object.entries(current).forEach(([key, child]) => visit(child, appendPath(path, key), key));
    }
  };

  visit(value, "$", "root");
  return matches;
}

/**
 * Generates a short preview string for a JSON node.
 */
export function getNodePreview(value: JsonValue): string {
  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (value !== null && typeof value === "object") {
    return `Object(${Object.keys(value).length})`;
  }

  if (typeof value === "string") {
    return `"${value}"`;
  }

  return String(value);
}
/**
 * Expands all nodes along a specific path in the tree.
 */
export function expandPath(
  path: string,
  setExpandedNodes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
) {
  const segments = path
    .replace(/^\$\./, "")
    .replace(/^\$/, "")
    .split(/(?=\.)|(?=\[)/)
    .filter(Boolean);

  let current = "$";
  setExpandedNodes((existing) => {
    const next: Record<string, boolean> = { ...existing, $: true };

    segments.forEach((segment) => {
      if (segment.startsWith(".")) {
        current = appendPath(current, segment.slice(1));
      } else if (segment.startsWith("[")) {
        current = appendPath(current, Number(segment.slice(1, -1)));
      }

      next[current] = true;
    });

    return next;
  });
}

/**
 * Collapses all nodes in the tree.
 */
export function collapseAllNodes(
  value: JsonValue,
  setExpandedNodes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
) {
  const next: Record<string, boolean> = { $: false };

  const visit = (current: JsonValue, path: string) => {
    if (Array.isArray(current)) {
      current.forEach((child, index) => {
        const nextPath = appendPath(path, index);
        next[nextPath] = false;
        visit(child, nextPath);
      });
      return;
    }

    if (current !== null && typeof current === "object") {
      Object.entries(current).forEach(([key, child]) => {
        const nextPath = appendPath(path, key);
        next[nextPath] = false;
        visit(child, nextPath);
      });
    }
  };

  visit(value, "$");
  setExpandedNodes(next);
}

/**
 * Gets the first selectable node in a JSON structure.
 */
export function getFirstSelectableNode(value: JsonValue): SelectedNode | null {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { path: "$", value };
    }

    return {
      path: appendPath("$", 0),
      value: value[0],
    };
  }

  if (value !== null && typeof value === "object") {
    const firstEntry = Object.entries(value)[0];
    if (!firstEntry) {
      return { path: "$", value };
    }

    return {
      path: appendPath("$", firstEntry[0]),
      value: firstEntry[1],
    };
  }

  return { path: "$", value };
}
