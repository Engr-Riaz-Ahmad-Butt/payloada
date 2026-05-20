"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

import type { JsonValue } from "../core/types";

// ---------------------------------------------------------------------------
// Lazy-load the heavy React Flow bundle — only downloaded when the graph opens.
// ---------------------------------------------------------------------------

const ReactFlowGraph = dynamic(
  () => import("./graph-view-inner").then((mod) => ({ default: mod.ReactFlowGraph })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[26rem] items-center justify-center rounded-sm border-[0.5px] border-ui-border bg-[#0a0a0a] sm:h-[32rem] xl:h-130">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1E2433] border-t-[#C07040]" />
          <p className="font-mono text-[12px] text-[#5A6070]">Loading graph…</p>
        </div>
      </div>
    ),
  },
);

// ---------------------------------------------------------------------------
// Build the raw node tree — imported lazily to avoid bundling buildFullTree
// in the server bundle unnecessarily. We import it here (not in inner) so
// the graph shape is computed once in the parent before passing down.
// ---------------------------------------------------------------------------

// Inline a lightweight version of buildFullTree here so it doesn't create
// a circular dependency with graph-view-inner.
function previewVal(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value.length > 24 ? `"${value.slice(0, 24)}…"` : `"${value}"`;
  if (typeof value === "number") return String(value);
  return "";
}

export type RawGraphNode = {
  id: string;
  parentId: string | null;
  depth: number;
  label: string;
  subtitle: string;
  tone: "root" | "container" | "leaf";
  hasChildren: boolean;
  childCount: number;
  x: number;
  y: number;
};

function buildRawNodes(value: JsonValue): RawGraphNode[] {
  const nodes: RawGraphNode[] = [];
  const levelY = new Map<number, number>();

  const nextY = (depth: number) => {
    const cur = levelY.get(depth) ?? 0;
    levelY.set(depth, cur + 110);
    return cur;
  };

  const visit = (
    current: JsonValue,
    label: string,
    depth: number,
    id: string,
    parentId: string | null,
  ) => {
    const isArray = Array.isArray(current);
    const isObject = current !== null && typeof current === "object" && !isArray;
    const hasChildren = isArray || isObject;
    const childCount = isArray ? current.length : isObject ? Object.keys(current).length : 0;
    const subtitle = isArray
      ? `Array(${current.length})`
      : isObject
      ? `Object(${childCount} keys)`
      : previewVal(current);

    nodes.push({
      id,
      parentId,
      depth,
      label,
      subtitle,
      tone: depth === 0 ? "root" : hasChildren ? "container" : "leaf",
      hasChildren,
      childCount,
      x: depth * 240,
      y: nextY(depth),
    });

    if (isArray) {
      current.forEach((item, index) => {
        visit(item, `[${index}]`, depth + 1, `${id}::${index}`, id);
      });
    } else if (isObject) {
      Object.entries(current).forEach(([key, child], index) => {
        visit(child, key, depth + 1, `${id}::${index}`, id);
      });
    }
  };

  visit(value, "root", 0, "root", null);
  return nodes;
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function JsonGraphView({ value }: { value: JsonValue }) {
  const rawNodes = useMemo(() => buildRawNodes(value), [value]);
  return <ReactFlowGraph rawNodes={rawNodes} />;
}
