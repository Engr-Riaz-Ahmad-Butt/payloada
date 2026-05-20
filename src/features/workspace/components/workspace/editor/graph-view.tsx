"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

import type { GraphNodeData, JsonValue } from "../core/types";
import { buildJsonGraph } from "../shared/utils";

// Lazy-load the heavy React Flow bundle — only downloaded when the graph panel opens.
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

export function JsonGraphView({ value }: { value: JsonValue }) {
  const graph = useMemo(() => buildJsonGraph(value), [value]);

  return <ReactFlowGraph nodes={graph.nodes} edges={graph.edges} />;
}
