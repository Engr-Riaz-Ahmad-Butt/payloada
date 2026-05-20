"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Hash, Type, HelpCircle, FileText, ToggleLeft, Clipboard, Check, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JsonValue } from "../core/types";

interface ColumnViewProps {
  value: JsonValue;
  onSelectNode?: (path: string, val: JsonValue) => void;
}

function getValueTypeIcon(val: JsonValue) {
  if (val === null) return <HelpCircle className="size-3.5 text-[#5A6070]" />;
  if (Array.isArray(val)) return <span className="text-[11px] font-bold text-[#d69463] font-mono">[ ]</span>;
  if (typeof val === "object") return <span className="text-[11px] font-bold text-[#C07040] font-mono">{"{ }"}</span>;
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return <Calendar className="size-3.5 text-[#C77DFF]" />;
    return <Type className="size-3.5 text-[#3DD68C]" />;
  }
  if (typeof val === "number") return <Hash className="size-3.5 text-[#F5A623]" />;
  if (typeof val === "boolean") return <ToggleLeft className="size-3.5 text-[#79C0FF]" />;
  return <FileText className="size-3.5 text-[#8B92A8]" />;
}

function formatValueType(val: JsonValue): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return `Array (${val.length} items)`;
  if (typeof val === "object") return `Object (${Object.keys(val).length} keys)`;
  return typeof val;
}

function getNestedValue(root: JsonValue, pathKeys: string[]): JsonValue {
  let current = root;
  for (const k of pathKeys) {
    if (current === null || typeof current !== "object") {
      return null;
    }
    if (Array.isArray(current)) {
      const idx = parseInt(k, 10);
      current = current[idx] ?? null;
    } else {
      current = (current as Record<string, JsonValue>)[k] ?? null;
    }
  }
  return current;
}

function buildJsonPath(pathKeys: string[]): string {
  if (pathKeys.length === 0) return "$";
  return "$." + pathKeys
    .map((k) => {
      if (/^\d+$/.test(k)) {
        return `[${k}]`;
      }
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k)) {
        return k;
      }
      return `["${k.replace(/"/g, '\\"')}"]`;
    })
    .join(".")
    .replace(/\.\[/g, "[");
}

export function ColumnView({ value, onSelectNode }: ColumnViewProps) {
  const [activePaths, setActivePaths] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedVal, setCopiedVal] = useState(false);

  // Auto scroll to the right when a new column is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [activePaths.length]);

  const handleSelectKey = (columnIndex: number, key: string) => {
    const nextPaths = activePaths.slice(0, columnIndex);
    nextPaths.push(key);
    setActivePaths(nextPaths);

    if (onSelectNode) {
      const path = buildJsonPath(nextPaths);
      const childVal = getNestedValue(value, nextPaths);
      onSelectNode(path, childVal);
    }
  };

  const copyToClipboard = async (text: string, type: "path" | "value") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "path") {
        setCopiedPath(true);
        setTimeout(() => setCopiedPath(false), 2000);
      } else {
        setCopiedVal(true);
        setTimeout(() => setCopiedVal(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  // Compile the list of columns to render
  const columns: Array<{
    title: string;
    value: JsonValue;
    selectedIndex: string | null;
  }> = [];

  // Column 0: Root
  columns.push({
    title: "root",
    value: value,
    selectedIndex: activePaths[0] ?? null,
  });

  // Subsequent columns for selected keys
  for (let i = 0; i < activePaths.length; i++) {
    const pathSlice = activePaths.slice(0, i + 1);
    const val = getNestedValue(value, pathSlice);
    const selected = activePaths[i + 1] ?? null;
    columns.push({
      title: activePaths[i],
      value: val,
      selectedIndex: selected,
    });
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-[380px] overflow-x-auto divide-x-[0.5px] divide-ui-border bg-[#050505] rounded-[10px] border-[0.5px] border-ui-border scrollbar-thin scrollbar-thumb-ui-border"
    >
      {columns.map((col, colIdx) => {
        const colVal = col.value;
        const isLastColumn = colIdx === columns.length - 1;

        // If it's a primitive or null, render a beautiful Details Inspector Panel
        if (colVal === null || typeof colVal !== "object") {
          const pathString = buildJsonPath(activePaths.slice(0, colIdx));
          return (
            <div
              key={`details-${colIdx}`}
              className="flex min-w-[280px] max-w-[340px] flex-col bg-[#0b0b0b] p-4 sm:p-5 flex-shrink-0 overflow-y-auto"
            >
              <div className="mb-4 border-b-[0.5px] border-ui-border pb-3">
                <span className="text-[10px] font-bold tracking-[0.05em] text-[#5A6070] uppercase">Value Detail</span>
                <h3 className="mt-1 font-mono text-[13px] font-semibold text-[#C07040] break-all">{col.title}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-[#5A6070]">JSONPath</p>
                  <p className="mt-1 font-mono text-[12px] text-[#F5F1EA] bg-[#14161F] p-2 rounded-[6px] border-[0.5px] border-ui-border break-all">
                    {pathString}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-[#5A6070]">Data Type</p>
                  <div className="mt-1 flex items-center gap-2 text-[12px] font-medium text-[#3DD68C]">
                    {getValueTypeIcon(colVal)}
                    <span>{formatValueType(colVal)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-[#5A6070]">Raw Value</p>
                  <pre className="mt-1 max-h-[160px] overflow-auto rounded-[6px] border-[0.5px] border-ui-border bg-[#050505] p-3 font-mono text-[12px] text-[#E8EAF0] whitespace-pre-wrap break-all">
                    {colVal === null ? "null" : String(colVal)}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => copyToClipboard(pathString, "path")}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-[6px] border-[0.5px] border-[#2A2F42] bg-[#161616] text-[11px] font-semibold text-[#E8EAF0] transition-colors hover:border-[#C07040]"
                  >
                    {copiedPath ? <Check className="size-3 text-[#3DD68C]" /> : <Clipboard className="size-3" />}
                    {copiedPath ? "Copied" : "Copy Path"}
                  </button>
                  <button
                    onClick={() => copyToClipboard(colVal === null ? "null" : String(colVal), "value")}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-[6px] border-[0.5px] border-[#2A2F42] bg-[#161616] text-[11px] font-semibold text-[#E8EAF0] transition-colors hover:border-[#C07040]"
                  >
                    {copiedVal ? <Check className="size-3 text-[#3DD68C]" /> : <Clipboard className="size-3" />}
                    {copiedVal ? "Copied" : "Copy Value"}
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Render standard Object / Array key navigation list
        const entries: Array<{ key: string; child: JsonValue }> = Array.isArray(colVal)
          ? colVal.map((child, idx) => ({ key: String(idx), child }))
          : Object.entries(colVal).map(([key, child]) => ({ key, child }));

        return (
          <div
            key={`col-${colIdx}`}
            className="flex min-w-[200px] max-w-[260px] flex-col bg-[#121212] flex-shrink-0 h-full overflow-hidden"
          >
            {/* Header path label */}
            <div className="flex h-10 items-center justify-between border-b-[0.5px] border-ui-border bg-[#171717] px-3.5">
              <span className="font-mono text-[11px] font-semibold text-[#8B92A8] truncate max-w-[140px]">
                {col.title}
              </span>
              <span className="rounded-sm bg-[#1e1e1e] px-1.5 py-0.5 font-mono text-[9px] text-[#5A6070]">
                {entries.length}
              </span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-ui-border">
              {entries.map(({ key, child }) => {
                const isSelected = col.selectedIndex === key;
                const isChildContainer = child !== null && typeof child === "object";

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectKey(colIdx, key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-left transition-colors outline-none",
                      isSelected
                        ? "bg-[#1F140C] text-[#C07040]"
                        : "text-[#8B92A8] hover:bg-[#1A1D24] hover:text-[#E8EAF0]"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getValueTypeIcon(child)}
                      <span className="font-mono text-[12px] font-medium truncate">{key}</span>
                    </div>

                    {isChildContainer ? (
                      <ChevronRight
                        className={cn("size-3.5 shrink-0 transition-colors", isSelected ? "text-[#C07040]" : "text-[#3A4060]")}
                      />
                    ) : (
                      <span className="font-mono text-[10px] text-[#3A4060] truncate max-w-[60px] ml-2">
                        {child === null ? "null" : String(child)}
                      </span>
                    )}
                  </button>
                );
              })}

              {entries.length === 0 && (
                <div className="flex h-24 items-center justify-center text-center text-[11px] font-medium text-[#3A4060]">
                  Empty {Array.isArray(colVal) ? "Array" : "Object"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
