"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FileDiff, Info, ShieldAlert, XCircle } from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { IssueCard, SidebarEmpty, SidebarSection, StatTile } from "../shared";
import type { DiffEditorHandle, DiffPaneEditor } from "../core/types";
import { buildDiffSummary, buildLineDiff } from "../shared/utils";

const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  {
    ssr: false,
  },
);

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
});

export function DiffWorkspace({
  diffOld,
  diffNew,
  setDiffOld,
  setDiffNew,
  summary,
}: {
  diffOld: string;
  diffNew: string;
  setDiffOld: React.Dispatch<React.SetStateAction<string>>;
  setDiffNew: React.Dispatch<React.SetStateAction<string>>;
  summary: ReturnType<typeof buildDiffSummary>;
}) {
  const isDesktopDiff = useMediaQuery("(min-width: 1024px)");
  const [syncScrolling, setSyncScrolling] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const diffEditorRef = useRef<DiffEditorHandle | null>(null);
  const isSyncingScrollRef = useRef(false);
  const originalDecorationIdsRef = useRef<string[]>([]);
  const modifiedDecorationIdsRef = useRef<string[]>([]);

  const visualDiff = useMemo(
    () => buildLineDiff(diffOld, diffNew, ignoreWhitespace),
    [diffNew, diffOld, ignoreWhitespace],
  );
  const totalDifferences =
    (summary?.added.length ?? 0) +
    (summary?.removed.length ?? 0) +
    (summary?.changed.length ?? 0) +
    (summary?.typeChanges.length ?? 0);

  useEffect(() => {
    const diffEditor = diffEditorRef.current;
    if (!diffEditor) {
      return;
    }

    const originalEditor = diffEditor.getOriginalEditor();
    const modifiedEditor = diffEditor.getModifiedEditor();

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
    const diffEditor = diffEditorRef.current;
    if (!diffEditor) {
      return;
    }

    const originalEditor = diffEditor.getOriginalEditor();
    const modifiedEditor = diffEditor.getModifiedEditor();

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

    const disposableOriginal = syncTo(modifiedEditor, originalEditor);
    const disposableModified = syncTo(originalEditor, modifiedEditor);

    return () => {
      disposableOriginal.dispose();
      disposableModified.dispose();
    };
  }, [syncScrolling]);

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
                "rounded-sm border-[0.5px] px-3 py-1.5 text-xs font-semibold transition-colors",
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
                "rounded-sm border-[0.5px] px-3 py-1.5 text-xs font-semibold transition-colors",
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
              className="rounded-sm border-[0.5px] border-ui-border bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-[#d6c3b5] transition-colors hover:border-[#2A2F42] focus-visible:border-[#C07040] focus-visible:outline-none"
            >
              Swap Sides
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-[13px] font-normal text-[#d6c3b5]">
            {totalDifferences} differences found
          </span>
          <div className="flex items-center gap-3 font-mono text-[13px] font-normal">
            <span className="text-[#f1b0b0]">-{summary?.removed.length ?? 0}</span>
            <span className="text-[#8ed08e]">+{summary?.added.length ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-h-0 2xl:border-r-[0.5px] 2xl:border-ui-border">
          {isDesktopDiff ? (
            <>
              <div className="grid grid-cols-2 border-b-[0.5px] border-ui-border bg-surface-elevated font-mono text-[13px] font-normal text-on-surface-variant">
                <div className="border-r-[0.5px] border-ui-border px-4 py-3 sm:px-5">
                  Original JSON (prod-config-v1.json)
                </div>
                <div className="px-4 py-3 sm:px-5">Modified JSON (prod-config-v2.json)</div>
              </div>

              <div className="h-[460px] bg-[#050505] md:h-[560px] xl:h-155 2xl:h-[calc(100vh-240px)]">
                <MonacoDiffEditor
                  height="100%"
                  language="json"
                  original={diffOld}
                  modified={diffNew}
                  theme="vs-dark"
                  onMount={(editor) => {
                    diffEditorRef.current = editor as unknown as DiffEditorHandle;
                    const originalModel = editor.getModel()?.original;
                    const modifiedModel = editor.getModel()?.modified;

                    originalModel?.onDidChangeContent(() => {
                      const nextValue = originalModel.getValue();
                      setDiffOld((current) => (current === nextValue ? current : nextValue));
                    });

                    modifiedModel?.onDidChangeContent(() => {
                      const nextValue = modifiedModel.getValue();
                      setDiffNew((current) => (current === nextValue ? current : nextValue));
                    });
                  }}
                  options={{
                    automaticLayout: true,
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    originalEditable: true,
                    renderIndicators: true,
                    lineNumbers: "on",
                    wordWrap: "off",
                    padding: { top: 20, bottom: 20 },
                    fontSize: 15,
                    lineHeight: 28,
                    fontFamily: "var(--font-mono)",
                    ignoreTrimWhitespace: ignoreWhitespace,
                    diffWordWrap: "off",
                  }}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 bg-[#050505] px-3 py-4 sm:px-4">
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="Added" value={String(summary?.added.length ?? 0)} />
                <StatTile label="Removed" value={String(summary?.removed.length ?? 0)} />
                <StatTile label="Changed" value={String(summary?.changed.length ?? 0)} />
                <StatTile label="Type changes" value={String(summary?.typeChanges.length ?? 0)} />
              </div>

              <div className="overflow-hidden rounded-sm border-[0.5px] border-ui-border bg-obsidian-base">
                <div className="border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 font-mono text-[13px] font-normal text-on-surface-variant">
                  Original JSON (prod-config-v1.json)
                </div>
                <div className="h-[260px]">
                  <MonacoEditor
                    height="100%"
                    language="json"
                    theme="vs-dark"
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
                    theme="vs-dark"
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
            </div>
          )}
        </div>

        <aside className="min-h-0 border-t-[0.5px] border-ui-border bg-surface-elevated 2xl:border-t-0">
          <SidebarSection title="Diff summary">
            {summary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatTile label="Added fields" value={String(summary.added.length)} />
                  <StatTile label="Removed fields" value={String(summary.removed.length)} />
                  <StatTile label="Changed values" value={String(summary.changed.length)} />
                  <StatTile label="Type changes" value={String(summary.typeChanges.length)} />
                </div>

                <div className="space-y-2">
                  {summary.changed.slice(0, 2).map((item) => (
                    <IssueCard
                      key={item}
                      tone="warning"
                      icon={<Info className="size-4" />}
                      title="Changed"
                      body={item}
                    />
                  ))}
                  {summary.typeChanges.slice(0, 2).map((item) => (
                    <IssueCard
                      key={item}
                      tone="warning"
                      icon={<ShieldAlert className="size-4" />}
                      title="Type changed"
                      body={item}
                    />
                  ))}
                  {summary.removed.slice(0, 2).map((item) => (
                    <IssueCard
                      key={item}
                      tone="error"
                      icon={<XCircle className="size-4" />}
                      title="Removed"
                      body={item}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <SidebarEmpty text="Add original and updated JSON to compare changes." />
            )}
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}
