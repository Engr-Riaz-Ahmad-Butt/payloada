"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import type { GraphNodeData, JsonValue } from "../core/types";
import { buildJsonGraph } from "../shared/utils";

export function JsonGraphView({ value }: { value: JsonValue }) {
  const graph = useMemo(() => buildJsonGraph(value), [value]);

  return (
    <div className="h-[520px] overflow-hidden rounded-sm border border-[#262626] bg-[#0a0a0a]">
      <ReactFlowProvider>
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={{ jsonNode: JsonGraphNode }}
          fitView
          minZoom={0.35}
          maxZoom={1.6}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          className="bg-[#0a0a0a]"
        >
          <Background color="#1f1f1f" gap={18} />
          <MiniMap
            pannable
            zoomable
            style={{
              background: "#111111",
              border: "1px solid #262626",
            }}
            nodeColor={(node) =>
              node.data?.tone === "root"
                ? "#c07040"
                : node.data?.tone === "container"
                ? "#e3c290"
                : "#7db87d"
            }
            maskColor="rgba(8,8,8,0.78)"
          />
          <Controls
            showInteractive={false}
            style={{
              background: "#111111",
              border: "1px solid #262626",
              borderRadius: "2px",
            }}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

function JsonGraphNode({ data }: { data: GraphNodeData }) {
  const toneStyles =
    data.tone === "root"
      ? {
          border: "#5c2f16",
          title: "#c07040",
          subtitle: "#f5f1ea",
          background: "#14100d",
        }
      : data.tone === "container"
      ? {
          border: "#3f3527",
          title: "#e3c290",
          subtitle: "#d9c2b6",
          background: "#111111",
        }
      : {
          border: "#23402a",
          title: "#7db87d",
          subtitle: "#f5f1ea",
          background: "#0f1410",
        };

  return (
    <div
      className="min-w-[170px] max-w-[220px] rounded-sm border px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      style={{
        backgroundColor: toneStyles.background,
        borderColor: toneStyles.border,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#262626", border: "none" }}
      />
      <p
        className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: toneStyles.title }}
      >
        {data.title}
      </p>
      <p className="mt-1 font-mono text-[11px] leading-5" style={{ color: toneStyles.subtitle }}>
        {data.subtitle}
      </p>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#c07040", border: "none" }}
      />
    </div>
  );
}
