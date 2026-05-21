"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "@xyflow/react";
import { ChevronRight, Download, ImageDown } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import type { GraphNodeData } from "../core/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RawNode = {
  id: string;
  parentId: string | null;
  depth: number;
  label: string;
  subtitle: string;
  tone: GraphNodeData["tone"];
  hasChildren: boolean;
  childCount: number;
  x: number;
  y: number;
};

type FlowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: GraphNodeData & {
    collapsed: boolean;
    hasChildren: boolean;
    childCount: number;
    onToggle: () => void;
  };
  draggable: boolean;
};

type FlowEdge = {
  id: string;
  source: string;
  target: string;
  style?: React.CSSProperties;
};


// ---------------------------------------------------------------------------
// Filter tree by collapsed set
// ---------------------------------------------------------------------------

function getCollapsedAncestors(rawNodes: RawNode[], collapsed: Set<string>): Set<string> {
  // For each node, find if any ancestor is collapsed
  const hiddenIds = new Set<string>();
  for (const node of rawNodes) {
    if (node.parentId === null) continue;
    // Walk up the parent chain
    let cur: RawNode | undefined = rawNodes.find((n) => n.id === node.parentId);
    while (cur) {
      if (collapsed.has(cur.id)) {
        hiddenIds.add(node.id);
        break;
      }
      cur = rawNodes.find((n) => n.id === cur!.parentId);
    }
  }
  return hiddenIds;
}

// ---------------------------------------------------------------------------
// Export helpers (unchanged from previous version)
// ---------------------------------------------------------------------------

const IMAGE_WIDTH = 2400;
const IMAGE_HEIGHT = 1600;
const PADDING = 80;

function buildSvgFromFlow(rfInstance: ReturnType<typeof useReactFlow>): string | null {
  const nodes = rfInstance.getNodes();
  if (!nodes.length) return null;

  const bounds = getNodesBounds(nodes);
  const viewport = getViewportForBounds(bounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.1, 2, PADDING);
  const flowEl = document.querySelector(".react-flow__nodes");
  if (!flowEl) return null;

  const nodeEls = Array.from(flowEl.querySelectorAll<HTMLElement>(".react-flow__node"));
  const svgNodes = nodeEls
    .map((el) => {
      const transform = el.style.transform;
      const match = /translate\(([^,]+)px,\s*([^)]+)px\)/.exec(transform);
      if (!match) return "";
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      const w = el.offsetWidth || 200;
      const h = el.offsetHeight || 60;
      const tone = el.querySelector<HTMLElement>("[data-tone]")?.dataset.tone ?? "";
      const bg = tone === "root" ? "#14100d" : tone === "container" ? "#111111" : "#0f1410";
      const titleColor = tone === "root" ? "#c07040" : tone === "container" ? "#e3c290" : "#7db87d";
      const titleEl = el.querySelector<HTMLElement>("[data-node-title]");
      const subtitleEl = el.querySelector<HTMLElement>("[data-node-subtitle]");
      const title = escapeXml(titleEl?.textContent ?? "");
      const subtitle = escapeXml(subtitleEl?.textContent ?? "");
      return `<g transform="translate(${x},${y})">
        <rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" stroke="#1E2433" stroke-width="0.5" rx="2"/>
        <text x="10" y="16" font-family="monospace" font-size="11" font-weight="600" fill="${titleColor}">${title}</text>
        <text x="10" y="32" font-family="monospace" font-size="10" fill="#f5f1ea" opacity="0.75">${subtitle}</text>
      </g>`;
    })
    .join("");

  const edgeEls = Array.from(
    document.querySelectorAll<SVGPathElement>(".react-flow__edge path.react-flow__edge-path"),
  );
  const svgEdges = edgeEls
    .map((el) => `<path d="${el.getAttribute("d") ?? ""}" stroke="#1E2433" stroke-width="1" fill="none"/>`)
    .join("");

  const { x: vx, y: vy, zoom } = viewport;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
  <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="#0a0a0a"/>
  <defs><pattern id="dots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="#1f1f1f"/></pattern></defs>
  <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="url(#dots)"/>
  <g transform="translate(${vx},${vy}) scale(${zoom})">${svgEdges}${svgNodes}</g>
  <text x="${IMAGE_WIDTH - 16}" y="${IMAGE_HEIGHT - 12}" font-family="monospace" font-size="11" fill="#2A2F42" text-anchor="end">Payloada</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

async function downloadPng(svgString: string, filename: string): Promise<void> {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.width = IMAGE_WIDTH;
  img.height = IMAGE_HEIGHT;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_WIDTH;
  canvas.height = IMAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) { reject(new Error("Canvas toBlob failed")); return; }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(b);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      resolve();
    }, "image/png");
  });
}

function downloadSvg(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ---------------------------------------------------------------------------
// Export panel
// ---------------------------------------------------------------------------

function ExportPanel() {
  const rfInstance = useReactFlow();

  async function handleExport(format: "svg" | "png") {
    const svg = buildSvgFromFlow(rfInstance);
    if (!svg) { toast.error("No graph to export"); return; }
    try {
      if (format === "svg") {
        downloadSvg(svg, "payloada-graph.svg");
        toast.success("Graph exported as SVG");
      } else {
        await downloadPng(svg, "payloada-graph.png");
        toast.success("Graph exported as PNG");
      }
    } catch {
      toast.error("Export failed — try a smaller JSON first");
    }
  }

  return (
    <Panel position="top-right">
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => void handleExport("svg")} title="Export as SVG"
          className="flex items-center gap-1.5 rounded-md border-[0.5px] border-[#2A2F42] bg-[#111111]/90 px-2.5 py-1.5 text-[11px] font-medium text-[#8B92A8] backdrop-blur-sm transition-colors hover:border-[#C07040]/50 hover:text-[#E8EAF0] focus-visible:outline-none">
          <Download className="size-3" /> SVG
        </button>
        <button type="button" onClick={() => void handleExport("png")} title="Export as PNG"
          className="flex items-center gap-1.5 rounded-md border-[0.5px] border-[#2A2F42] bg-[#111111]/90 px-2.5 py-1.5 text-[11px] font-medium text-[#8B92A8] backdrop-blur-sm transition-colors hover:border-[#C07040]/50 hover:text-[#E8EAF0] focus-visible:outline-none">
          <ImageDown className="size-3" /> PNG
        </button>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Collapse controls panel
// ---------------------------------------------------------------------------

function GraphControlsPanel({
  collapsedCount,
  totalCollapsible,
  onExpandAll,
  onCollapseAll,
  layoutMode,
  onChangeLayoutMode,
}: {
  collapsedCount: number;
  totalCollapsible: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  layoutMode: "LR" | "TB";
  onChangeLayoutMode: (mode: "LR" | "TB") => void;
}) {
  return (
    <Panel position="top-left">
      <div className="flex items-center gap-1.5 rounded-md border-[0.5px] border-[#2A2F42] bg-[#111111]/90 p-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-1 border-r border-[#2A2F42] pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={onCollapseAll}
            disabled={collapsedCount === totalCollapsible}
            title="Collapse all nodes"
            className="rounded px-2 py-1 text-[11px] font-medium text-[#8B92A8] transition-colors hover:bg-[#1A1D24] hover:text-[#E8EAF0] disabled:opacity-30 focus-visible:outline-none"
          >
            Collapse all
          </button>
          <button
            type="button"
            onClick={onExpandAll}
            disabled={collapsedCount === 0}
            title="Expand all nodes"
            className="rounded px-2 py-1 text-[11px] font-medium text-[#8B92A8] transition-colors hover:bg-[#1A1D24] hover:text-[#E8EAF0] disabled:opacity-30 focus-visible:outline-none"
          >
            Expand all
          </button>
          {collapsedCount > 0 ? (
            <span className="ml-1 rounded-full border-[0.5px] border-[#C07040]/30 bg-[#1F140C]/90 px-2 py-0.5 text-[10px] font-medium text-[#C07040]">
              {collapsedCount} collapsed
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 bg-[#1A1D24]/50 p-0.5 rounded border border-[#2A2F42]/30">
          <button
            type="button"
            onClick={() => onChangeLayoutMode("LR")}
            title="Left-to-Right Horizontal layout"
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold transition-colors focus-visible:outline-none",
              layoutMode === "LR"
                ? "bg-[#C07040] text-white"
                : "text-[#8B92A8] hover:text-[#E8EAF0]"
            )}
          >
            Horiz
          </button>
          <button
            type="button"
            onClick={() => onChangeLayoutMode("TB")}
            title="Top-to-Bottom Vertical layout"
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold transition-colors focus-visible:outline-none",
              layoutMode === "TB"
                ? "bg-[#C07040] text-white"
                : "text-[#8B92A8] hover:text-[#E8EAF0]"
            )}
          >
            Vert
          </button>
        </div>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Collapsible node renderer
// ---------------------------------------------------------------------------

type CollapsibleNodeData = GraphNodeData & {
  collapsed: boolean;
  hasChildren: boolean;
  childCount: number;
  onToggle: () => void;
  layoutMode: "LR" | "TB";
};

function JsonGraphNode({ data }: { data: CollapsibleNodeData }) {
  const toneStyles =
    data.tone === "root"
      ? { border: "#1E2433", title: "#c07040", subtitle: "#f5f1ea", background: "#14100d" }
      : data.tone === "container"
      ? { border: "#1E2433", title: "#e3c290", subtitle: "#d9c2b6", background: "#111111" }
      : { border: "#1E2433", title: "#7db87d", subtitle: "#f5f1ea", background: "#0f1410" };

  const isHorizontal = data.layoutMode === "LR";

  return (
    <div
      data-tone={data.tone}
      className={cn(
        "min-w-[170px] max-w-[220px] rounded-sm border-[0.5px] px-3 py-2",
        data.hasChildren && "cursor-pointer select-none transition-opacity hover:opacity-90",
      )}
      style={{ backgroundColor: toneStyles.background, borderColor: toneStyles.border }}
      onClick={data.hasChildren ? data.onToggle : undefined}
      title={data.hasChildren ? (data.collapsed ? "Click to expand" : "Click to collapse") : undefined}
    >
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        style={{ background: "#262626", border: "none" }}
      />

      <div className="flex items-center justify-between gap-2">
        <p
          data-node-title
          className="truncate font-mono text-[12px] font-semibold tracking-[0.02em]"
          style={{ color: toneStyles.title }}
        >
          {data.title}
        </p>
        {data.hasChildren ? (
          <ChevronRight
            className="size-3 shrink-0 transition-transform duration-200"
            style={{
              color: toneStyles.title,
              opacity: 0.6,
              transform: data.collapsed ? "rotate(0deg)" : "rotate(90deg)",
            }}
          />
        ) : null}
      </div>

      <p
        data-node-subtitle
        className="mt-1 truncate font-mono text-[11px] leading-5"
        style={{ color: toneStyles.subtitle, opacity: 0.85 }}
      >
        {data.collapsed && data.childCount > 0
          ? `▶ ${data.childCount} ${data.childCount === 1 ? "child" : "children"} hidden`
          : data.subtitle}
      </p>

      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
        style={{ background: "#c07040", border: "none" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

type GraphProps = {
  rawNodes: RawNode[];
};

function ReactFlowGraphInner({ rawNodes }: GraphProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [layoutMode, setLayoutMode] = useState<"LR" | "TB">("LR");

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const collapsibleIds = useMemo(
    () => rawNodes.filter((n) => n.hasChildren && n.parentId !== null).map((n) => n.id),
    [rawNodes],
  );

  const hiddenIds = useMemo(() => getCollapsedAncestors(rawNodes, collapsed), [rawNodes, collapsed]);

  const computedPositions = useMemo(() => {
    const visibleNodes = rawNodes.filter((n) => !hiddenIds.has(n.id));
    const childrenMap = new Map<string, string[]>();
    for (const node of visibleNodes) {
      if (node.parentId !== null) {
        if (!childrenMap.has(node.parentId)) {
          childrenMap.set(node.parentId, []);
        }
        childrenMap.get(node.parentId)!.push(node.id);
      }
    }

    const positions = new Map<string, { x: number; y: number }>();
    let leafCounter = 0;

    function layoutNode(nodeId: string, depth: number) {
      const children = childrenMap.get(nodeId) || [];
      const isCollapsed = collapsed.has(nodeId);

      if (children.length === 0 || isCollapsed) {
        const val = leafCounter * (layoutMode === "LR" ? 90 : 220);
        leafCounter++;

        let x = 0;
        let y = 0;
        if (layoutMode === "LR") {
          x = depth * 260;
          y = val;
        } else {
          x = val;
          y = depth * 140;
        }

        positions.set(nodeId, { x, y });
        return val;
      }

      let sum = 0;
      for (const childId of children) {
        sum += layoutNode(childId, depth + 1);
      }
      const val = sum / children.length;

      let x = 0;
      let y = 0;
      if (layoutMode === "LR") {
        x = depth * 260;
        y = val;
      } else {
        x = val;
        y = depth * 140;
      }

      positions.set(nodeId, { x, y });
      return val;
    }

    if (rawNodes.length > 0) {
      layoutNode("root", 0);
    }

    return positions;
  }, [rawNodes, hiddenIds, collapsed, layoutMode]);

  const flowNodes: FlowNode[] = useMemo(
    () =>
      rawNodes
        .filter((n) => !hiddenIds.has(n.id))
        .map((n) => {
          const pos = computedPositions.get(n.id) || { x: n.x, y: n.y };
          return {
            id: n.id,
            type: "jsonNode",
            position: pos,
            data: {
              title: n.label,
              subtitle: n.subtitle,
              tone: n.tone,
              collapsed: collapsed.has(n.id),
              hasChildren: n.hasChildren,
              childCount: n.childCount,
              onToggle: () => toggle(n.id),
              layoutMode,
            },
            draggable: true,
          };
        }),
    [rawNodes, hiddenIds, collapsed, toggle, computedPositions, layoutMode],
  );

  const flowEdges: FlowEdge[] = useMemo(
    () =>
      rawNodes
        .filter((n) => n.parentId !== null && !hiddenIds.has(n.id))
        .map((n) => ({
          id: `${n.parentId}-${n.id}`,
          source: n.parentId!,
          target: n.id,
          style: { stroke: "#3a3939", strokeWidth: 1.25 },
        })),
    [rawNodes, hiddenIds],
  );

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={{ jsonNode: JsonGraphNode as never }}
      fitView
      minZoom={0.25}
      maxZoom={2}
      attributionPosition="bottom-left"
      proOptions={{ hideAttribution: true }}
      className="bg-[#0a0a0a]"
    >
      <Background color="#1f1f1f" gap={18} />
      <MiniMap
        pannable
        zoomable
        style={{ background: "#111111", border: "0.5px solid #1E2433" }}
        nodeColor={(node) =>
          (node.data as CollapsibleNodeData)?.tone === "root"
            ? "#c07040"
            : (node.data as CollapsibleNodeData)?.tone === "container"
            ? "#e3c290"
            : "#7db87d"
        }
        maskColor="rgba(8,8,8,0.78)"
      />
      <Controls
        showInteractive={false}
        style={{ background: "#111111", border: "0.5px solid #1E2433", borderRadius: "2px" }}
      />
      <GraphControlsPanel
        collapsedCount={collapsed.size}
        totalCollapsible={collapsibleIds.length}
        onExpandAll={() => setCollapsed(new Set())}
        onCollapseAll={() => setCollapsed(new Set(collapsibleIds))}
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
      />
      <ExportPanel />
    </ReactFlow>
  );
}

export function ReactFlowGraph({ rawNodes }: GraphProps) {
  return (
    <div className="h-[26rem] overflow-hidden rounded-sm border-[0.5px] border-ui-border bg-[#0a0a0a] sm:h-[32rem] xl:h-130">
      <ReactFlowProvider>
        <ReactFlowGraphInner rawNodes={rawNodes} />
      </ReactFlowProvider>
    </div>
  );
}
