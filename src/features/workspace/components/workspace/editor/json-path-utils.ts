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

export function evaluateJsonPathQuery(value: JsonValue, query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return { matches: [] as SearchMatch[], error: null as string | null };
  }

  if (!trimmed.startsWith("$")) {
    return {
      matches: [] as SearchMatch[],
      error: 'JSONPath should start with "$".',
    };
  }

  const tokenPattern = /\.\.([A-Za-z_$][\w$]*)|\.([A-Za-z_$][\w$]*)|(\.\*)|\[(\d+|\*)\]/g;
  const tokens: Array<
    | { type: "recursive"; key: string }
    | { type: "property"; key: string }
    | { type: "wildcard" }
    | { type: "index"; value: number | "*" }
  > = [];

  let cursor = 1;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(trimmed)) !== null) {
    if (match.index !== cursor) {
      return {
        matches: [] as SearchMatch[],
        error: `Unsupported JSONPath segment near "${trimmed.slice(cursor)}".`,
      };
    }

    if (match[1]) {
      tokens.push({ type: "recursive", key: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "property", key: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "wildcard" });
    } else if (match[4]) {
      tokens.push({
        type: "index",
        value: match[4] === "*" ? "*" : Number(match[4]),
      });
    }

    cursor = match.index + match[0].length;
  }

  if (cursor !== trimmed.length) {
    return {
      matches: [] as SearchMatch[],
      error: `Unsupported JSONPath segment near "${trimmed.slice(cursor)}".`,
    };
  }

  let current: Array<{ path: string; value: JsonValue }> = [{ path: "$", value }];

  for (const token of tokens) {
    const next: Array<{ path: string; value: JsonValue }> = [];

    for (const item of current) {
      if (token.type === "property") {
        if (item.value !== null && typeof item.value === "object" && !Array.isArray(item.value)) {
          const child = (item.value as Record<string, JsonValue>)[token.key];
          if (child !== undefined) {
            next.push({ path: appendPath(item.path, token.key), value: child });
          }
        }
        continue;
      }

      if (token.type === "index") {
        if (Array.isArray(item.value)) {
          if (token.value === "*") {
            item.value.forEach((child, index) => {
              next.push({ path: appendPath(item.path, index), value: child });
            });
          } else {
            const child = item.value[token.value];
            if (child !== undefined) {
              next.push({ path: appendPath(item.path, token.value), value: child });
            }
          }
        }
        continue;
      }

      if (token.type === "wildcard") {
        if (Array.isArray(item.value)) {
          item.value.forEach((child, index) => {
            next.push({ path: appendPath(item.path, index), value: child });
          });
        } else if (item.value !== null && typeof item.value === "object") {
          Object.entries(item.value).forEach(([key, child]) => {
            next.push({ path: appendPath(item.path, key), value: child });
          });
        }
        continue;
      }

      if (token.type === "recursive") {
        collectRecursiveMatches(item.value, item.path, token.key, next);
      }
    }

    current = next;
  }

  return {
    matches: current.map((item) => ({
      path: item.path,
      preview: previewValue(item.value),
      value: item.value,
    })),
    error: null as string | null,
  };
}

function collectRecursiveMatches(
  value: JsonValue,
  path: string,
  key: string,
  matches: Array<{ path: string; value: JsonValue }>,
) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      collectRecursiveMatches(child, appendPath(path, index), key, matches);
    });
    return;
  }

  if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => {
      const childPath = appendPath(path, childKey);
      if (childKey === key) {
        matches.push({ path: childPath, value: childValue });
      }
      collectRecursiveMatches(childValue, childPath, key, matches);
    });
  }
}
