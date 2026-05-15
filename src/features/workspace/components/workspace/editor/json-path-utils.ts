import type { JsonValue, SearchMatch, SelectedNode } from "../core/types";

export function findSearchMatches(value: JsonValue, query: string) {
  const term = query.toLowerCase();
  const matches: SearchMatch[] = [];

  const visit = (current: JsonValue, path: string, label: string) => {
    const preview = previewValue(current);
    if (
      path.toLowerCase().includes(term) ||
      label.toLowerCase().includes(term) ||
      preview.toLowerCase().includes(term)
    ) {
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

export function getFirstSelectableNode(value: JsonValue): SelectedNode | null {
  if (Array.isArray(value)) {
    return value.length ? { path: "$[0]", value: value[0] } : { path: "$", value };
  }

  if (value !== null && typeof value === "object") {
    const [key, child] = Object.entries(value)[0] ?? [];
    return key ? { path: `$.${key}`, value: child } : { path: "$", value };
  }

  return { path: "$", value };
}

export function getValueAtPath(value: JsonValue, path: string): JsonValue | undefined {
  if (path === "$") {
    return value;
  }

  const segments = Array.from(path.matchAll(/(?:\.([A-Za-z_$][\w$]*))|\[(\d+)\]/g));
  let current: JsonValue = value;

  for (const segment of segments) {
    const key = segment[1];
    const index = segment[2];

    if (Array.isArray(current) && index !== undefined) {
      current = current[Number(index)];
      continue;
    }

    if (current !== null && typeof current === "object" && key !== undefined) {
      current = (current as Record<string, JsonValue>)[key];
      continue;
    }

    return undefined;
  }

  return current;
}

export function appendPath(parent: string, segment: string | number) {
  if (typeof segment === "number") {
    return `${parent}[${segment}]`;
  }

  return parent === "$" ? `$.${segment}` : `${parent}.${segment}`;
}

export function previewValue(value: JsonValue) {
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

export function renderJsonValue(value: JsonValue) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}
