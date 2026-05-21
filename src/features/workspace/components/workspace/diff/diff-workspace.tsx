"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FileDiff } from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

import { SidebarEmpty, SidebarSection, SmallAction } from "../shared";
import type { DiffPaneEditor } from "../core/types";
import { buildDiffSummary, buildLineDiff } from "../shared/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
});

type DiffSummary = ReturnType<typeof buildDiffSummary>;

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
  const { monacoTheme } = useTheme();
  const isDesktopDiff = useMediaQuery("(min-width: 1024px)");
  const isWideSidebar = useMediaQuery("(min-width: 1536px)");
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

  useEffect(() => {
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
          background: "#0D2E23",
          border: "#1D4D35",
          text: "#3DD68C",
        },
        {
          label: "Removed fields",
          value: String(summary.removed.length),
          background: "#2A0D10",
          border: "#4A1520",
          text: "#FF5C6C",
        },
        {
          label: "Changed values",
          value: String(summary.changed.length),
          background: "#2A1A00",
          border: "#4A3000",
          text: "#F5A623",
        },
        {
          label: "Type changes",
          value: String(summary.typeChanges.length),
          background: "#0D1F2E",
          border: "#1A3A50",
          text: "#79C0FF",
        },
      ]
    : [];

  const detailItems = summary
    ? [
        ...summary.changed.map((item) => ({ kind: "changed" as const, raw: item })),
        ...summary.typeChanges.map((item) => ({ kind: "type" as const, raw: item })),
        ...summary.removed.map((item) => ({ kind: "removed" as const, raw: item })),
      ]
    : [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-obsidian-base">
      <div className="flex flex-col gap-4 border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[14px] font-medium text-[#E8EAF0]">
            <FileDiff className="size-4 text-[#c07040]" />
            JSON diff
          </div>
          <div className="hidden h-5 w-px bg-ui-border lg:block" />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSyncScrolling((current) => !current)}
              className={cn(
                "h-9 rounded-sm border-[0.5px] px-3 text-xs font-semibold transition-colors",
                syncScrolling
                  ? "border-[#2A2F42] bg-[#2a1c13] text-[#d69463]"
                  : "border-ui-border bg-[#0a0a0a] text-[#d6c3b5]",
              )}
            >
              Sync Scrolling
            </button>
            <button
              type="button"
              onClick={() => setIgnoreWhitespace((current) => !current)}
              className={cn(
                "h-9 rounded-sm border-[0.5px] px-3 text-xs font-semibold transition-colors",
                ignoreWhitespace
                  ? "border-[#2A2F42] bg-[#2a1c13] text-[#d69463]"
                  : "border-ui-border bg-[#0a0a0a] text-[#d6c3b5]",
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
              className="h-9 rounded-sm border-[0.5px] border-ui-border bg-[#0a0a0a] px-3 text-xs font-semibold text-[#d6c3b5] transition-colors hover:border-[#2A2F42] focus-visible:border-[#C07040] focus-visible:outline-none"
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
              onClick={() => onDownload(diffReport, "jsonova-diff-report.txt")}
            />
            <button
              type="button"
              onClick={() => void onCopy(diffReport, "Copied shareable diff report")}
              className="h-9 rounded-sm border-[0.5px] border-[#C07040] bg-transparent px-3 text-xs font-semibold text-[#d6c3b5] transition-colors hover:border-[#D48050] focus-visible:border-[#C07040] focus-visible:outline-none"
            >
              Share diff
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[13px] font-normal text-[#d6c3b5]">
              {totalDifferences} differences found
            </span>
            <div className="flex items-center gap-3 font-mono text-[13px] font-normal">
              <span className="text-[#FF5C6C]">-{summary?.removed.length ?? 0}</span>
              <span className="text-[#3DD68C]">+{summary?.added.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1",
          isWideSidebar ? "grid 2xl:grid-cols-[minmax(0,1fr)_320px]" : "flex flex-col",
        )}
      >
        <div className={cn("min-h-0", isWideSidebar ? "border-r-[0.5px] border-ui-border" : "")}>
          {isDesktopDiff ? (
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex border-b-[0.5px] border-ui-border bg-surface-elevated font-mono text-[13px] font-normal text-on-surface-variant">
                <div className="w-1/2 border-r-[0.5px] border-ui-border px-4 py-3 sm:px-5">
                  Original JSON (prod-config-v1.json)
                </div>
                <div className="w-1/2 px-4 py-3 sm:px-5">Modified JSON (prod-config-v2.json)</div>
              </div>

              <div className="flex h-[420px] flex-row md:h-[520px] xl:h-[620px] 2xl:h-[calc(100vh-240px)]">
                <div className="flex min-h-0 w-1/2 flex-col overflow-hidden border-r-[0.5px] border-[#1E2433] bg-[#050505]">
                  <div className="flex-1 overflow-hidden">
                    <MonacoEditor
                      height="100%"
                      language="json"
                      theme={monacoTheme}
                      value={diffOld}
                      onChange={(value) => setDiffOld(value ?? "")}
                      onMount={(editor) => {
                        originalEditorRef.current = editor as unknown as DiffPaneEditor;
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
                        fontSize: 15,
                        lineHeight: 28,
                        tabSize: 2,
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex min-h-0 w-1/2 flex-col overflow-hidden bg-[#050505]">
                  <div className="flex-1 overflow-hidden">
                    <MonacoEditor
                      height="100%"
                      language="json"
                      theme={monacoTheme}
                      value={diffNew}
                      onChange={(value) => setDiffNew(value ?? "")}
                      onMount={(editor) => {
                        modifiedEditorRef.current = editor as unknown as DiffPaneEditor;
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
                        fontSize: 15,
                        lineHeight: 28,
                        tabSize: 2,
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-[#050505] px-3 py-4 sm:px-4">
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
                <SidebarSection title="Diff details">
                  {detailItems.length > 0 ? (
                    <div className="space-y-2">
                      {detailItems.map((item) => (
                        <DiffDetailItem key={`${item.kind}-${item.raw}`} item={item} />
                      ))}
                    </div>
                  ) : (
                    <SidebarEmpty text="Add original and updated JSON to compare changes." />
                  )}
                </SidebarSection>
              </div>
            </div>
          )}
        </div>

        {isWideSidebar ? (
          <aside className="min-h-0 overflow-y-auto bg-surface-elevated">
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
                      <DiffDetailItem key={`${item.kind}-${item.raw}`} item={item} />
                    ))}
                  </div>
                </div>
              ) : (
                <SidebarEmpty text="Add original and updated JSON to compare changes." />
              )}
            </SidebarSection>
          </aside>
        ) : null}
      </div>

      {!isWideSidebar && isDesktopDiff ? (
        <div className="border-t-[0.5px] border-ui-border bg-surface-elevated">
          <SidebarSection title="Diff summary">
            {summary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {statCards.map((card) => (
                    <DiffStatCard key={card.label} {...card} />
                  ))}
                </div>

                <div className="space-y-2">
                  {detailItems.map((item) => (
                    <DiffDetailItem key={`${item.kind}-${item.raw}`} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              <SidebarEmpty text="Add original and updated JSON to compare changes." />
            )}
          </SidebarSection>
        </div>
      ) : null}
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

function DiffDetailItem({ item }: { item: { kind: "changed" | "type" | "removed"; raw: string } }) {
  if (item.kind === "removed") {
    return (
      <div className="rounded-[8px] border-[0.5px] border-[#4A1520] bg-[#2A0D10] px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="text-[12px] leading-none text-[#FF5C6C]">✕</span>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#FF5C6C]">Removed</p>
            <p className="mt-1 font-mono text-[11px] text-[#8B92A8]">{item.raw}</p>
          </div>
        </div>
      </div>
    );
  }

  const [path, remainder = ""] = item.raw.split(": ");
  const [oldValue = "", newValue = ""] = remainder.split(" -> ");

  if (item.kind === "type") {
    return (
      <div className="rounded-[8px] border-[0.5px] border-[#1A3A50] bg-[#0D1F2E] px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="text-[12px] leading-none text-[#79C0FF]">ⓘ</span>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#79C0FF]">Type changed</p>
            <p className="mt-1 font-mono text-[11px] text-[#8B92A8]">{path}</p>
            <p className="mt-1 font-mono text-[11px] text-[#E8EAF0]">
              <span className="text-[#FF5C6C]">{oldValue}</span>
              <span className="px-1 text-[#8B92A8]">→</span>
              <span className="text-[#3DD68C]">{newValue}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border-[0.5px] border-[#4A3000] bg-[#2A1A00] px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-[12px] leading-none text-[#F5A623]">⟳</span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#F5A623]">Changed</p>
          <p className="mt-1 font-mono text-[11px] text-[#8B92A8]">{path}</p>
          <p className="mt-1 font-mono text-[11px] text-[#E8EAF0]">
            <span className="text-[#FF5C6C]">{oldValue}</span>
            <span className="px-1 text-[#8B92A8]">→</span>
            <span className="text-[#3DD68C]">{newValue}</span>
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
    "JSONova diff report",
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
    summary.changed.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (summary.typeChanges.length > 0) {
    lines.push("Type changes:");
    summary.typeChanges.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join("\n").trim();
}
