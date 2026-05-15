"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

import type { JsonValue } from "../core/types";
import { appendPath, previewValue } from "../shared/utils";

export function TreeNode({
  label,
  path,
  value,
  selectedPath,
  onSelect,
  onCopy,
}: {
  label: string;
  path: string;
  value: JsonValue;
  selectedPath: string | null;
  onSelect: React.Dispatch<React.SetStateAction<string | null>>;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(path === "$");
  const isContainer = Array.isArray(value) || (value !== null && typeof value === "object");
  const isSelected = selectedPath === path;
  const children = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : value !== null && typeof value === "object"
    ? Object.entries(value)
    : [];

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "group flex min-w-0 items-start gap-2 rounded-sm px-2 py-1.5 transition-colors",
          isSelected ? "bg-[#1f1f1f]" : "hover:bg-[#111111]",
        )}
      >
        {isContainer ? (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="mt-0.5 shrink-0 text-[#a89589]"
          >
            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : (
          <span className="inline-flex w-3.5 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(path)}
          className="min-w-0 flex-1 whitespace-nowrap text-left font-mono text-xs leading-6"
        >
          <span className="text-[#d69463]">{label}</span>
          <span className="text-[#6d655f]">: </span>
          <span className="text-[#f5f1ea]">{previewValue(value)}</span>
        </button>

        <button
          type="button"
          onClick={() => onCopy(path, "Copied JSONPath")}
          className="hidden shrink-0 text-[#7f766f] group-hover:block"
        >
          <Copy className="size-3.5" />
        </button>
      </div>

      {isContainer && open ? (
        <div className="ml-4 min-w-0 border-l border-[#262626] pl-3">
          {children.map(([key, child]) => (
            <TreeNode
              key={`${path}-${key}`}
              label={Array.isArray(value) ? `[${key}]` : key}
              path={appendPath(path, Array.isArray(value) ? Number(key) : key)}
              value={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onCopy={onCopy}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
