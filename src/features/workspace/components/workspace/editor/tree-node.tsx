"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

function detectHexColor(v: string): string | null {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{8})$/.test(v) ? v : null;
}

function detectIsoDate(v: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}/.test(v)) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  const sign = diff < 0 ? "in " : "";
  const suffix = diff < 0 ? "" : " ago";
  if (abs < 60_000) return "just now";
  if (abs < 3_600_000) return `${sign}${Math.round(abs / 60_000)}m${suffix}`;
  if (abs < 86_400_000) return `${sign}${Math.round(abs / 3_600_000)}h${suffix}`;
  return `${sign}${Math.round(abs / 86_400_000)}d${suffix}`;
}

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
  treeSearchTerm,
  treeMatchPaths,
  activeMatchPath,
}: {
  label: string;
  path: string;
  value: JsonValue;
  selectedPath: string | null;
  onSelect: React.Dispatch<React.SetStateAction<string | null>>;
  onCopy: (value: string, message?: string) => Promise<void>;
  treeSearchTerm?: string;
  treeMatchPaths?: Set<string>;
  activeMatchPath?: string | null;
}) {
  const [open, setOpen] = useState(path === "$");
  const isContainer = Array.isArray(value) || (value !== null && typeof value === "object");
  const isSelected = selectedPath === path;
  const preview = previewValue(value);
  const children = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : value !== null && typeof value === "object"
    ? Object.entries(value)
    : [];
  const hasSearch = Boolean(treeSearchTerm?.trim());
  const isMatch = hasSearch ? Boolean(treeMatchPaths?.has(path)) : true;
  const hasMatchingDescendant = hasSearch
    ? Array.from(treeMatchPaths ?? []).some(
        (matchPath) => matchPath !== path && isDescendantPath(matchPath, path),
      )
    : false;
  const isVisibleInSearch = !hasSearch || isMatch || hasMatchingDescendant;
  const shouldRenderOpen = open || hasMatchingDescendant;
  const isActiveMatch = hasSearch && activeMatchPath === path;

  return (
    <div className="space-y-1">
      <div
        data-tree-path={path}
        className={cn(
          "group flex min-w-0 items-start gap-2 rounded-sm px-2 py-1.5 transition-colors",
          isActiveMatch
            ? "border-[0.5px] border-copper-accent bg-[#2A1508]"
            : isSelected
            ? "bg-surface-container-low"
            : isMatch && hasSearch
            ? "bg-[#1F140C]"
            : "hover:bg-surface-container-low",
          hasSearch && !isVisibleInSearch ? "opacity-30" : "",
        )}
      >
        {isContainer ? (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="mt-0.5 shrink-0 text-on-surface-variant"
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
          <HighlightedTreeText
            text={label}
            tone="key"
            query={treeSearchTerm ?? ""}
            defaultClassName="text-copper-accent"
          />
          <span className="text-outline-variant">: </span>
          <HighlightedTreeText
            text={preview}
            tone="value"
            query={treeSearchTerm ?? ""}
            defaultClassName="text-text-primary"
          />
          {typeof value === "string" ? (() => {
            const hex = detectHexColor(value);
            if (hex) {
              return (
                <span
                  title={hex}
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: hex,
                    marginLeft: 5,
                    verticalAlign: "middle",
                    border: "1px solid rgba(255,255,255,0.15)",
                    flexShrink: 0,
                  }}
                />
              );
            }
            const date = detectIsoDate(value);
            if (date) {
              return (
                <span
                  title={`${date.toLocaleString()} · ${relativeTime(date)}`}
                  style={{ marginLeft: 5, fontSize: 9, color: "#5A8A6A", letterSpacing: "0.04em" }}
                >
                  {relativeTime(date)}
                </span>
              );
            }
            return null;
          })() : null}
        </button>

        <button
          type="button"
          onClick={() => onCopy(path, "Copied JSONPath")}
          className="hidden shrink-0 text-outline-variant group-hover:block"
        >
          <Copy className="size-3.5" />
        </button>
      </div>

      {isContainer && shouldRenderOpen ? (
        <div className="ml-4 min-w-0 border-l-[0.5px] border-ui-border pl-3">
          {children.map(([key, child]) => (
            <TreeNode
              key={`${path}-${key}`}
              label={Array.isArray(value) ? `[${key}]` : key}
              path={appendPath(path, Array.isArray(value) ? Number(key) : key)}
              value={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onCopy={onCopy}
              treeSearchTerm={treeSearchTerm}
              treeMatchPaths={treeMatchPaths}
              activeMatchPath={activeMatchPath}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function isDescendantPath(candidate: string, parent: string) {
  if (parent === "$") {
    return candidate !== "$";
  }

  return candidate.startsWith(`${parent}.`) || candidate.startsWith(`${parent}[`);
}

function HighlightedTreeText({
  text,
  query,
  tone,
  defaultClassName,
}: {
  text: string;
  query: string;
  tone: "key" | "value";
  defaultClassName: string;
}) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return <span className={defaultClassName}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return <span className={defaultClassName}>{text}</span>;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + trimmedQuery.length);
  const after = text.slice(matchIndex + trimmedQuery.length);

  return (
    <span className={defaultClassName}>
      {before}
      <span
        className={cn(
          "rounded-[3px] px-0.5 text-[#C07040]",
          tone === "key" ? "bg-[#2A1508]" : "bg-[#2A1508]",
        )}
      >
        {match}
      </span>
      {after}
    </span>
  );
}
