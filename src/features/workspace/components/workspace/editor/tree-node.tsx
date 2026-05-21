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
