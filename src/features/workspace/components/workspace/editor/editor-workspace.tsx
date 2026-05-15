"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, Copy, FileJson2, Info, ShieldAlert, XCircle } from "lucide-react";

import { parseJsonSafe } from "@/lib/json";
import { cn } from "@/lib/utils";
import type { JsonStats } from "@/types/json";

import {
  CodePreview,
  IssueCard,
  JsonGraphView,
  SidebarEmpty,
  SidebarSection,
  SmallAction,
  StatsGrid,
  TreeNode,
} from "../shared";
import type { EditorInstance, InspectorView, SearchMatch, SelectedNode } from "../core/types";
import { renderJsonValue } from "../shared/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export function EditorWorkspace({
  source,
  setSource,
  parseResult,
  formattedOutput,
  stats,
  inspectorView,
  setInspectorView,
  intelligentIssues,
  searchTerm,
  searchMatches,
  selectedNode,
  setSelectedPath,
  onCopy,
  editorRef,
  linePosition,
  setLinePosition,
  onClear,
}: {
  source: string;
  setSource: React.Dispatch<React.SetStateAction<string>>;
  parseResult: ReturnType<typeof parseJsonSafe> | null;
  formattedOutput: string;
  stats: JsonStats;
  inspectorView: InspectorView;
  setInspectorView: React.Dispatch<React.SetStateAction<InspectorView>>;
  intelligentIssues: {
    sensitive: null | { path: string };
    warning: null | string;
  };
  searchTerm: string;
  searchMatches: SearchMatch[];
  selectedNode: SelectedNode | null;
  setSelectedPath: React.Dispatch<React.SetStateAction<string | null>>;
  onCopy: (value: string, message?: string) => Promise<void>;
  editorRef: React.MutableRefObject<EditorInstance | null>;
  linePosition: { line: number; column: number };
  setLinePosition: React.Dispatch<React.SetStateAction<{ line: number; column: number }>>;
  onClear: () => void;
}) {
  return (
    <div
      className={cn(
        "grid h-full min-h-0",
        inspectorView === "none"
          ? "grid-cols-1"
          : inspectorView === "graph"
          ? "xl:grid-cols-2"
          : "xl:grid-cols-[minmax(0,1fr)_320px]",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col",
          inspectorView === "none" ? "" : "border-r border-ui-border",
        )}
      >
        <div className="flex items-center justify-between border-b border-ui-border bg-[#171717] px-5 py-3">
          <span className="font-mono text-sm text-[#d6c3b5]">input.json</span>
          <div className="flex items-center gap-2 text-[#d6c3b5]">
            <button type="button" onClick={() => onCopy(source, "Copied editor content")}>
              <Copy className="size-4" />
            </button>
            <button type="button" onClick={onClear}>
              <XCircle className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-[#050505]">
          {!source.trim() ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050505]/90 p-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#1d1d1d]">
                  <FileJson2 className="size-5 text-[#d69463]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Paste your JSON here</h3>
                  <p className="mt-2 text-sm text-[#a89589]">
                    You can also upload a file, load a URL, or try a sample.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <MonacoEditor
            height="100%"
            language="json"
            theme="vs-dark"
            value={source}
            onChange={(value) => setSource(value ?? "")}
            onMount={(instance) => {
              editorRef.current = instance as EditorInstance;
              instance.onDidChangeCursorPosition(
                (event: { position: { lineNumber: number; column: number } }) => {
                  setLinePosition({
                    line: event.position.lineNumber,
                    column: event.position.column,
                  });
                },
              );
            }}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 22, bottom: 22 },
              fontSize: 15,
              lineHeight: 28,
              tabSize: 2,
              fontFamily: "var(--font-geist-mono)",
            }}
          />
        </div>

        <div className="flex items-center justify-between border-t border-ui-border bg-surface-elevated px-5 py-3 text-xs text-[#7b7068]">
          <div className="flex items-center gap-5">
            <span>UTF-8</span>
            <span>JSON</span>
            <span>2 spaces</span>
          </div>
          <span>
            Line {linePosition.line}, Column {linePosition.column}
          </span>
        </div>

        {selectedNode ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ui-border bg-[#171717] px-5 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7b7068]">Selected</p>
              <p className="mt-1 font-mono text-sm text-text-primary">{selectedNode.path}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SmallAction
                label="Copy Path"
                onClick={() => onCopy(selectedNode.path, "Copied JSONPath")}
              />
              <SmallAction
                label="Copy Value"
                onClick={() => onCopy(renderJsonValue(selectedNode.value), "Copied selected value")}
              />
              <SmallAction
                label="Copy Object"
                onClick={() =>
                  onCopy(JSON.stringify(selectedNode.value, null, 2), "Copied selected object")
                }
              />
            </div>
          </div>
        ) : null}
      </div>

      {inspectorView !== "none" ? (
        <aside className="flex min-h-0 flex-col overflow-y-auto bg-[#121212]">
          <div className="flex items-center justify-between border-b border-ui-border bg-[#171717] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a89589]">
              {inspectorView === "status"
                ? "Status"
                : inspectorView === "formatted"
                ? "Formatted"
                : inspectorView === "tree"
                ? "Tree"
                : inspectorView === "search"
                ? "Search"
                : "Graph"}
            </p>
            <button
              type="button"
              onClick={() => setInspectorView("none")}
              className="rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-1 text-[11px] font-semibold text-[#d6c3b5] transition-colors hover:border-[#c07040]"
            >
              Close
            </button>
          </div>
          {inspectorView === "status" ? (
            <>
              <SidebarSection title="Status">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-sm border px-4 py-4",
                    parseResult?.valid
                      ? "border-[#32593a] bg-[#0e130f] text-[#8ed08e]"
                      : "border-[#6b1e1e] bg-[#210b0b] text-[#e68f8f]",
                  )}
                >
                  {parseResult?.valid ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <XCircle className="size-5" />
                  )}
                  <span className="text-[15px] font-semibold">
                    {parseResult?.valid ? "Valid JSON" : "Invalid JSON"}
                  </span>
                </div>
              </SidebarSection>

              <SidebarSection title="Intelligent Issues">
                <div className="space-y-3">
                  {intelligentIssues.sensitive ? (
                    <IssueCard
                      tone="error"
                      icon={<ShieldAlert className="size-4" />}
                      title="Sensitive fields detected"
                      body={intelligentIssues.sensitive.path}
                    />
                  ) : null}
                  {intelligentIssues.warning ? (
                    <IssueCard
                      tone="warning"
                      icon={<Info className="size-4" />}
                      title="Type mismatch suggestion"
                      body={intelligentIssues.warning}
                    />
                  ) : null}
                  {!intelligentIssues.sensitive && !intelligentIssues.warning ? (
                    <IssueCard
                      tone="success"
                      icon={<CheckCircle2 className="size-4" />}
                      title="No blocking issues"
                      body="This payload is clean enough to keep exploring."
                    />
                  ) : null}
                </div>
              </SidebarSection>

              <SidebarSection title="Document Stats">
                <StatsGrid stats={stats} />
              </SidebarSection>
            </>
          ) : null}

          {inspectorView === "formatted" ? (
            <SidebarSection title="Formatted Output">
              {formattedOutput ? (
                <CodePreview value={formattedOutput} />
              ) : (
                <SidebarEmpty text="Formatted output appears here when JSON is valid." />
              )}
            </SidebarSection>
          ) : null}

          {inspectorView === "tree" ? (
            <SidebarSection title="Tree Explorer">
              {parseResult?.valid ? (
                <div className="space-y-2">
                  <p className="text-sm text-[#a89589]">
                    Click any node to reveal its JSONPath and copy its value.
                  </p>
                  <div className="overflow-x-auto rounded-sm border border-ui-border bg-[#0a0a0a] p-3">
                    <div className="min-w-max">
                      <TreeNode
                        label="root"
                        path="$"
                        value={parseResult.data}
                        selectedPath={selectedNode?.path ?? null}
                        onSelect={setSelectedPath}
                        onCopy={onCopy}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <SidebarEmpty text="Valid JSON will appear as an interactive tree here." />
              )}
            </SidebarSection>
          ) : null}

          {inspectorView === "search" ? (
            <SidebarSection title="Search Results">
              {searchTerm.trim() ? (
                searchMatches.length ? (
                  <div className="space-y-2">
                    <p className="text-sm text-[#a89589]">{searchMatches.length} matches found</p>
                    {searchMatches.slice(0, 8).map((match) => (
                      <button
                        key={match.path}
                        type="button"
                        onClick={() => {
                          setInspectorView("tree");
                          setSelectedPath(match.path);
                        }}
                        className="w-full rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3 text-left transition-colors hover:border-[#c07040]"
                      >
                        <p className="font-mono text-xs text-text-primary">{match.path}</p>
                        <p className="mt-1 text-xs text-[#a89589]">{match.preview}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <SidebarEmpty text="No matches found for the current search." />
                )
              ) : (
                <SidebarEmpty text="Search key, value, or path from the top bar." />
              )}
            </SidebarSection>
          ) : null}

          {inspectorView === "graph" ? (
            <SidebarSection title="Graph View">
              {parseResult?.valid ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#a89589]">
                    Explore the JSON structure as a node graph. Drag, zoom, and inspect nested
                    relationships.
                  </p>
                  <JsonGraphView value={parseResult.data} />
                </div>
              ) : (
                <SidebarEmpty text="Valid JSON will appear as an interactive graph here." />
              )}
            </SidebarSection>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
