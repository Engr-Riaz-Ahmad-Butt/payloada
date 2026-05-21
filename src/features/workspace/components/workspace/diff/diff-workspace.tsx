"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FileDiff } from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

import { SidebarEmpty, SidebarSection, SmallAction } from "../shared";
import type { DiffPaneEditor } from "../core/types";
import { buildDiffSummary, buildLineDiff } from "../shared/utils";
import type { DiffChangedEntry, DiffTypeChangeEntry } from "./diff-utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
});

type DiffSummary = ReturnType<typeof buildDiffSummary>;
type DiffDetailItemData =
  | { kind: "added"; raw: string }
  | { kind: "changed"; raw: DiffChangedEntry }
  | { kind: "type"; raw: DiffTypeChangeEntry }
  | { kind: "removed"; raw: string };

export function DiffWorkspace({
  diffOld,
  diffNew,
  setDiffOld,
  setDiffNew,
  summary,
  onCopy,
  onDownload,
}: {
  diffOld: string;
  diffNew: string;
  setDiffOld: React.Dispatch<React.SetStateAction<string>>;
  setDiffNew: React.Dispatch<React.SetStateAction<string>>;
  summary: DiffSummary;
  onCopy: (value: string, message?: string) => Promise<void>;
  onDownload: (content: string, filename: string) => void;
}) {
  const { monacoTheme, isDark } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [syncScrolling, setSyncScrolling] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const originalEditorRef = useRef<DiffPaneEditor | null>(null);
  const modifiedEditorRef = useRef<DiffPaneEditor | null>(null);
  const isSyncingScrollRef = useRef(false);
  const originalDecorationIdsRef = useRef<string[]>([]);
  const modifiedDecorationIdsRef = useRef<string[]>([]);

  const visualDiff = useMemo(
    () => buildLineDiff(diffOld, diffNew, ignoreWhitespace),
    [diffNew, diffOld, ignoreWhitespace],
  );
  const removedLineSet = useMemo(
    () => new Set(visualDiff.originalLines),
    [visualDiff.originalLines],
  );
  const addedLineSet = useMemo(() => new Set(visualDiff.modifiedLines), [visualDiff.modifiedLines]);
  const totalDifferences =
    (summary?.added.length ?? 0) +
    (summary?.removed.length ?? 0) +
    (summary?.changed.length ?? 0) +
    (summary?.typeChanges.length ?? 0);
  const diffReport = useMemo(() => buildDiffReport(summary), [summary]);

  const applyDecorations = useCallback(() => {
    const originalEditor = originalEditorRef.current;
    const modifiedEditor = modifiedEditorRef.current;
    if (!originalEditor || !modifiedEditor) {
      return;
    }

    originalDecorationIdsRef.current = originalEditor.deltaDecorations(
      originalDecorationIdsRef.current,
      visualDiff.originalLines.map((line) => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "jsonlines-diff-line-removed",
          linesDecorationsClassName: "jsonlines-diff-gutter-removed",
        },
      })),
    );

    modifiedDecorationIdsRef.current = modifiedEditor.deltaDecorations(
      modifiedDecorationIdsRef.current,
      visualDiff.modifiedLines.map((line) => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "jsonlines-diff-line-added",
          linesDecorationsClassName: "jsonlines-diff-gutter-added",
        },
      })),
    );
  }, [visualDiff]);

  useEffect(() => {
    applyDecorations();
  }, [applyDecorations]);

  useEffect(() => {
    const originalEditor = originalEditorRef.current;
    const modifiedEditor = modifiedEditorRef.current;
    if (!originalEditor || !modifiedEditor) {
      return;
    }

    const syncTo = (target: DiffPaneEditor, source: DiffPaneEditor) =>
      source.onDidScrollChange((event) => {
        if (!syncScrolling || !event.scrollTopChanged || isSyncingScrollRef.current) {
          return;
        }

        isSyncingScrollRef.current = true;
        target.setScrollTop(source.getScrollTop());
        window.requestAnimationFrame(() => {
          isSyncingScrollRef.current = false;
        });
      });

    const disposeOriginal = syncTo(modifiedEditor, originalEditor);
    const disposeModified = syncTo(originalEditor, modifiedEditor);

    return () => {
      disposeOriginal.dispose();
      disposeModified.dispose();
    };
  }, [syncScrolling]);

  const statCards = summary
    ? [
        {
          label: "Added fields",
          value: String(summary.added.length),
          background: isDark ? "#0D2E23" : "#ECFDF5",
          border: isDark ? "#1D4D35" : "#A7F3D0",
          text: isDark ? "#3DD68C" : "#047857",
        },
        {
          label: "Removed fields",
          value: String(summary.removed.length),
          background: isDark ? "#2A0D10" : "#FFF1F2",
          border: isDark ? "#4A1520" : "#FECDD3",
          text: isDark ? "#FF5C6C" : "#BE123C",
        },
        {
          label: "Changed values",
          value: String(summary.changed.length),
          background: isDark ? "#2A1A00" : "#FFFBEB",
          border: isDark ? "#4A3000" : "#FDE68A",
          text: isDark ? "#F5A623" : "#B45309",
        },
        {
          label: "Type changes",
          value: String(summary.typeChanges.length),
          background: isDark ? "#0D1F2E" : "#F0F9FF",
          border: isDark ? "#1A3A50" : "#BAE6FD",
          text: isDark ? "#79C0FF" : "#0369A1",
        },
      ]
    : [];

  const detailItems: DiffDetailItemData[] = summary
    ? [
        ...summary.added.map((item) => ({ kind: "added" as const, raw: item })),
        ...summary.changed.map((item) => ({ kind: "changed" as const, raw: item })),
        ...summary.typeChanges.map((item) => ({ kind: "type" as const, raw: item })),
        ...summary.removed.map((item) => ({ kind: "removed" as const, raw: item })),
      ]
    : [];

  const detailItemKey = (item: DiffDetailItemData) =>
    item.kind === "added" || item.kind === "removed"
      ? `${item.kind}-${item.raw}`
      : `${item.kind}-${item.raw.path}`;

  const summaryPanel = (
    <SidebarSection title="Diff summary">
      {summary ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((card) => (
              <DiffStatCard key={card.label} {...card} />
            ))}
          </div>
          <div className="space-y-2">
            {detailItems.map((item) => (
              <DiffDetailItem key={detailItemKey(item)} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <SidebarEmpty text="Add original and updated JSON to compare changes." />
      )}
    </SidebarSection>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-obsidian-base">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[14px] font-medium text-text-primary">
            <FileDiff className="size-4 text-copper-accent" />
            JSON diff
          </div>
          <div className="hidden h-5 w-px bg-ui-border lg:block" />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSyncScrolling((current) => !current)}
              className={cn(
                "h-9 rounded-sm border-[0.5px] px-3 text-xs font-semibold transition-colors focus-visible:outline-none",
                syncScrolling
                  ? "border-copper-accent bg-copper-accent/10 text-copper-accent"
                  : "border-ui-border bg-surface-elevated text-text-secondary hover:border-ui-border-hover hover:text-text-primary",
              )}
            >
              Sync Scrolling
            </button>
            <button
              type="button"
              onClick={() => setIgnoreWhitespace((current) => !current)}
              className={cn(
                "h-9 rounded-sm border-[0.5px] px-3 text-xs font-semibold transition-colors focus-visible:outline-none",
                ignoreWhitespace
                  ? "border-copper-accent bg-copper-accent/10 text-copper-accent"
                  : "border-ui-border bg-surface-elevated text-text-secondary hover:border-ui-border-hover hover:text-text-primary",
              )}
            >
              Ignore Whitespace
            </button>
            <button
              type="button"
              onClick={() => {
                setDiffOld(diffNew);
                setDiffNew(diffOld);
              }}
              className="h-9 rounded-sm border-[0.5px] border-ui-border bg-surface-elevated px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-ui-border-hover hover:text-text-primary focus-visible:border-copper-accent focus-visible:outline-none"
            >
              Swap Sides
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-9 items-center gap-2">
            <SmallAction
              label="Copy summary"
              onClick={() => void onCopy(diffReport, "Copied diff summary")}
            />
            <SmallAction
              label="Download report"
              onClick={() => onDownload(diffReport, "payloada-diff-report.txt")}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[13px] font-normal text-text-secondary">
              {totalDifferences} differences found
            </span>
            <div className="flex items-center gap-3 font-mono text-[13px] font-normal">
              <span className="text-red-600 dark:text-red-400">-{summary?.removed.length ?? 0}</span>
              <span className="text-emerald-600 dark:text-emerald-400">+{summary?.added.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout: editors left, summary sidebar right */}
      {isDesktop ? (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Editors pane */}
          <div className="flex min-h-0 flex-col border-r-[0.5px] border-ui-border">
            <div className="flex border-b-[0.5px] border-ui-border bg-surface-elevated font-mono text-[13px] font-normal text-on-surface-variant">
              <div className="w-1/2 border-r-[0.5px] border-ui-border px-4 py-3 sm:px-5">
                Original JSON (prod-config-v1.json)
              </div>
              <div className="w-1/2 px-4 py-3 sm:px-5">Modified JSON (prod-config-v2.json)</div>
            </div>

            <div className="flex min-h-0 flex-1 flex-row">
              <div className="flex min-h-0 w-1/2 flex-col overflow-hidden border-r-[0.5px] border-ui-border bg-obsidian-base">
                <div className="flex-1 overflow-hidden">
                  <MonacoEditor
                    height="100%"
                    language="json"
                    theme={monacoTheme}
                    value={diffOld}
                    onChange={(value) => setDiffOld(value ?? "")}
                    onMount={(editor) => {
                      originalEditorRef.current = editor as unknown as DiffPaneEditor;
                      applyDecorations();
                    }}
                    options={{
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: (lineNumber: number) =>
                        removedLineSet.has(lineNumber) ? `-${lineNumber}` : `${lineNumber}`,
                      lineNumbersMinChars: 4,
                      lineDecorationsWidth: 12,
                      glyphMargin: false,
                      wordWrap: "off",
                      padding: { top: 20, bottom: 20 },
                      fontSize: 14,
                      lineHeight: 26,
                      tabSize: 2,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                </div>
              </div>

              <div className="flex min-h-0 w-1/2 flex-col overflow-hidden bg-obsidian-base">
                <div className="flex-1 overflow-hidden">
                  <MonacoEditor
                    height="100%"
                    language="json"
                    theme={monacoTheme}
                    value={diffNew}
                    onChange={(value) => setDiffNew(value ?? "")}
                    onMount={(editor) => {
                      modifiedEditorRef.current = editor as unknown as DiffPaneEditor;
                      applyDecorations();
                    }}
                    options={{
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: (lineNumber: number) =>
                        addedLineSet.has(lineNumber) ? `+${lineNumber}` : `${lineNumber}`,
                      lineNumbersMinChars: 4,
                      lineDecorationsWidth: 12,
                      glyphMargin: false,
                      wordWrap: "off",
                      padding: { top: 20, bottom: 20 },
                      fontSize: 14,
                      lineHeight: 26,
                      tabSize: 2,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          <aside className="min-h-0 overflow-y-auto bg-surface-elevated">
            {summaryPanel}
          </aside>
        </div>
      ) : (
        /* Mobile layout: stacked */
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 bg-obsidian-base px-3 py-4 sm:px-4">
            {summary ? (
              <div className="grid grid-cols-2 gap-3">
                {statCards.map((card) => (
                  <DiffStatCard key={card.label} {...card} />
                ))}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-sm border-[0.5px] border-ui-border bg-obsidian-base">
              <div className="border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 font-mono text-[13px] font-normal text-on-surface-variant">
                Original JSON (prod-config-v1.json)
              </div>
              <div className="h-[260px]">
                <MonacoEditor
                  height="100%"
                  language="json"
                  theme={monacoTheme}
                  value={diffOld}
                  onChange={(value) => setDiffOld(value ?? "")}
                  options={{
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    wordWrap: "on",
                    padding: { top: 14, bottom: 14 },
                    fontSize: 13,
                    lineHeight: 24,
                    tabSize: 2,
                    fontFamily: "var(--font-mono)",
                  }}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border-[0.5px] border-ui-border bg-obsidian-base">
              <div className="border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 font-mono text-[13px] font-normal text-on-surface-variant">
                Modified JSON (prod-config-v2.json)
              </div>
              <div className="h-[260px]">
                <MonacoEditor
                  height="100%"
                  language="json"
                  theme={monacoTheme}
                  value={diffNew}
                  onChange={(value) => setDiffNew(value ?? "")}
                  options={{
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    wordWrap: "on",
                    padding: { top: 14, bottom: 14 },
                    fontSize: 13,
                    lineHeight: 24,
                    tabSize: 2,
                    fontFamily: "var(--font-mono)",
                  }}
                />
              </div>
            </div>

            <div className="rounded-sm border-[0.5px] border-ui-border bg-surface-elevated">
              {summaryPanel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiffStatCard({
  label,
  value,
  background,
  border,
  text,
}: {
  label: string;
  value: string;
  background: string;
  border: string;
  text: string;
}) {
  return (
    <div
      className="rounded-[8px] border-[0.5px] px-4 py-4"
      style={{ backgroundColor: background, borderColor: border }}
    >
      <p className="text-[10px] font-normal tracking-[0.05em]" style={{ color: text }}>
        {label}
      </p>
      <p className="mt-2 text-[36px] font-semibold leading-none" style={{ color: text }}>
        {value}
      </p>
    </div>
  );
}

function DiffDetailItem({ item }: { item: DiffDetailItemData }) {
  if (item.kind === "added") {
    return (
      <div className="rounded-[8px] border-[0.5px] border-emerald-500/20 bg-emerald-50 px-4 py-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
        <div className="flex items-start gap-3">
          <span className="text-[12px] leading-none text-emerald-600 dark:text-[#3DD68C]">+</span>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-emerald-600 dark:text-[#3DD68C]">Added</p>
            <p className="mt-1 font-mono text-[11px] text-text-secondary">{item.raw}</p>
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === "removed") {
    return (
      <div className="rounded-[8px] border-[0.5px] border-red-500/20 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-950/20">
        <div className="flex items-start gap-3">
          <span className="text-[12px] leading-none text-red-600 dark:text-[#FF5C6C]">&#x2715;</span>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-red-600 dark:text-[#FF5C6C]">Removed</p>
            <p className="mt-1 font-mono text-[11px] text-text-secondary">{item.raw}</p>
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === "type") {
    return (
      <div className="rounded-[8px] border-[0.5px] border-blue-500/20 bg-blue-50 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <span className="text-[12px] leading-none text-blue-600 dark:text-[#79C0FF]">&#9432;</span>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-blue-600 dark:text-[#79C0FF]">Type changed</p>
            <p className="mt-1 font-mono text-[11px] text-text-secondary">{item.raw.path}</p>
            <p className="mt-1 font-mono text-[11px] text-text-primary">
              <span className="text-red-600 dark:text-[#FF5C6C]">{item.raw.oldType}</span>
              <span className="px-1 text-text-secondary">&rarr;</span>
              <span className="text-emerald-600 dark:text-[#3DD68C]">{item.raw.newType}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border-[0.5px] border-amber-500/20 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <span className="text-[12px] leading-none text-amber-600 dark:text-[#F5A623]">&#8635;</span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-amber-600 dark:text-[#F5A623]">Changed</p>
          <p className="mt-1 font-mono text-[11px] text-text-secondary">{item.raw.path}</p>
          <p className="mt-1 font-mono text-[11px] text-text-primary">
            <span className="text-red-600 dark:text-[#FF5C6C]">{JSON.stringify(item.raw.oldValue)}</span>
            <span className="px-1 text-text-secondary">&rarr;</span>
            <span className="text-emerald-600 dark:text-[#3DD68C]">{JSON.stringify(item.raw.newValue)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function buildDiffReport(summary: DiffSummary) {
  if (!summary) {
    return "No diff summary available yet.";
  }

  const lines = [
    "Payloada diff report",
    "",
    `Added fields: ${summary.added.length}`,
    `Removed fields: ${summary.removed.length}`,
    `Changed values: ${summary.changed.length}`,
    `Type changes: ${summary.typeChanges.length}`,
    "",
  ];

  if (summary.added.length > 0) {
    lines.push("Added fields:");
    summary.added.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (summary.removed.length > 0) {
    lines.push("Removed fields:");
    summary.removed.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (summary.changed.length > 0) {
    lines.push("Changed values:");
    summary.changed.forEach((item) =>
      lines.push(`- ${item.path}: ${JSON.stringify(item.oldValue)} -> ${JSON.stringify(item.newValue)}`),
    );
    lines.push("");
  }

  if (summary.typeChanges.length > 0) {
    lines.push("Type changes:");
    summary.typeChanges.forEach((item) =>
      lines.push(`- ${item.path}: ${item.oldType} -> ${item.newType}`),
    );
  }

  return lines.join("\n").trim();
}
