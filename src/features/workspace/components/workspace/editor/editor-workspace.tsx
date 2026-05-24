"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Braces,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileJson2,
  Info,
  Loader2,
  Search,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

import { parseJsonSafe } from "@/lib/json";
import { cn } from "@/lib/utils";
import type { JsonStats } from "@/types/json";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "@/hooks/use-theme";

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
import { maskSensitiveValues } from "../shared/utils";
import type { EditorInstance, InspectorView, SearchMatch, SelectedNode } from "../core/types";
import { evaluateJsonPathQuery, findSearchMatches, renderJsonValue } from "../shared/utils";
import { ColumnView } from "./column-view";

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
  onPaste,
  onLoadSample,
  onFetchFromUrl,
  isParsing,
  workerParseMs,
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
  onPaste: () => Promise<void>;
  onLoadSample: () => void;
  onFetchFromUrl: () => void;
  isParsing?: boolean;
  workerParseMs?: number | null;
}) {
  const { monacoTheme } = useTheme();
  const hasDesktopInspectorLayout = useMediaQuery("(min-width: 1280px)");

  const handleRedactSensitive = () => {
    if (!parseResult?.valid) return;
    const masked = maskSensitiveValues(parseResult.data);
    setSource(JSON.stringify(masked, null, 2));
  };

  const handleAutoFix = () => {
    if (!parseResult?.valid) return;
    const fixed = JSON.stringify(
      parseResult.data,
      (_key, value) => {
        if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value)) {
          return parseFloat(value);
        }
        return value as unknown;
      },
      2,
    );
    setSource(fixed);
  };
  const showMobileGraphPanel = (inspectorView === "graph" || inspectorView === "columns") && !hasDesktopInspectorLayout;
  const [treeContainerElement, setTreeContainerElement] = useState<HTMLDivElement | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [jsonPathQuery, setJsonPathQuery] = useState("");
  const jsonPathState = useMemo(
    () =>
      parseResult?.valid
        ? evaluateJsonPathQuery(parseResult.data, jsonPathQuery)
        : { matches: [], error: null as string | null },
    [jsonPathQuery, parseResult],
  );
  const jsonPathExamples = ["$.*", "$..key", "$[0]", "$.array[*].field"];
  const [treeSearchTerm, setTreeSearchTerm] = useState("");
  const treeSearchMatches = useMemo(
    () =>
      parseResult?.valid && treeSearchTerm.trim()
        ? findSearchMatches(parseResult.data, treeSearchTerm)
        : [],
    [parseResult, treeSearchTerm],
  );
  const treeMatchPaths = useMemo<Set<string>>(
    () => new Set<string>(treeSearchMatches.map((match: SearchMatch) => match.path)),
    [treeSearchMatches],
  );
  const treeMatchIndex =
    treeSearchTerm.trim() && selectedNode
      ? treeSearchMatches.findIndex((match: SearchMatch) => match.path === selectedNode.path)
      : -1;
  const activeTreeMatchNumber =
    treeSearchTerm.trim() && treeSearchMatches.length ? Math.max(treeMatchIndex + 1, 1) : 0;

  useEffect(() => {
    if (!treeSearchTerm.trim() || !treeSearchMatches.length) {
      return;
    }

    if (!selectedNode || !treeMatchPaths.has(selectedNode.path)) {
      setSelectedPath((treeSearchMatches[0] as SearchMatch | undefined)?.path ?? null);
    }
  }, [selectedNode, setSelectedPath, treeMatchPaths, treeSearchMatches, treeSearchTerm]);

  useEffect(() => {
    if (!treeSearchTerm.trim() || !selectedNode?.path || !treeContainerElement) {
      return;
    }

    const target = Array.from(
      treeContainerElement.querySelectorAll<HTMLElement>("[data-tree-path]"),
    ).find((node) => node.dataset.treePath === selectedNode.path);
    target?.scrollIntoView({ block: "nearest" });
  }, [selectedNode?.path, treeContainerElement, treeSearchTerm]);

  const navigateTreeMatch = (direction: "next" | "previous") => {
    if (!treeSearchMatches.length) {
      return;
    }

    const currentIndex = treeMatchIndex >= 0 ? treeMatchIndex : 0;
    const offset = direction === "next" ? 1 : -1;
    const nextIndex = (currentIndex + offset + treeSearchMatches.length) % treeSearchMatches.length;
    setSelectedPath(treeSearchMatches[nextIndex]?.path ?? null);
  };

  const editorPane = (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        inspectorView === "none" ? "" : "border-r-[0.5px] border-ui-border",
      )}
    >
      <div className="flex items-center justify-between border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 sm:px-5">
        <span className="font-mono text-[13px] font-normal text-on-surface-variant">input.json</span>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <button type="button" onClick={() => onCopy(source, "Copied editor content")}>
            <Copy className="size-4" />
          </button>
          <button type="button" onClick={onClear}>
            <XCircle className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative min-h-[360px] flex-1 bg-obsidian-base md:min-h-[460px] xl:min-h-0">
        {!source.trim() ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-obsidian-base/90 p-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-surface-container-low">
                <FileJson2 className="size-5 text-copper-accent" />
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-text-primary">Paste your JSON here</h3>
                <p className="mt-2 text-[13px] font-normal leading-[1.6] text-text-secondary">
                  You can also upload a file, load a URL, or try a sample.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {isParsing ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-obsidian-base/75 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-ui-border bg-surface px-6 py-5 text-center">
              <Loader2 className="size-6 animate-spin text-copper-accent" />
              <div>
                <p className="text-[13px] font-semibold text-text-primary">Parsing large JSON</p>
                <p className="mt-1 text-[11px] text-outline-variant">Executing inside a background thread worker...</p>
              </div>
            </div>
          </div>
        ) : null}

        <MonacoEditor
          height="100%"
          language="json"
          theme={monacoTheme}
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
            fontSize: 13,
            lineHeight: 28,
            tabSize: 2,
            fontFamily: "var(--font-mono)",
          }}
        />
      </div>

      <div className="flex flex-col gap-2 border-t-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 font-mono text-[11px] font-normal text-outline-variant sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <span>UTF-8</span>
          <span>JSON</span>
          <span>2 spaces</span>
          {workerParseMs != null ? (
            <span title="Parsed by background Web Worker" style={{ color: "#C07040" }}>
              ⚡ Worker {workerParseMs}ms
            </span>
          ) : null}
        </div>
        <span>
          Line {linePosition.line}, Column {linePosition.column}
        </span>
      </div>

      {selectedNode ? (
        <div className="flex flex-col gap-3 border-t-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-[0.5px] text-outline-variant">Selected</p>
            <p className="mt-1 font-mono text-[13px] font-normal text-copper-accent">
              {selectedNode.path}
            </p>
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
  );

  const inspectorPane =
    inspectorView !== "none" ? (
      <aside className="flex min-h-[320px] flex-col overflow-y-auto border-t-[0.5px] border-ui-border bg-surface xl:min-h-0 xl:border-t-0">
        <div className="flex items-center justify-between border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-3">
          <p className="text-[11px] font-medium tracking-[0.5px] text-outline-variant">
            {inspectorView === "status"
              ? "Status"
              : inspectorView === "formatted"
              ? "Formatted"
              : inspectorView === "tree"
              ? "Tree"
              : inspectorView === "search"
              ? "Search"
              : inspectorView === "graph"
              ? "Graph"
              : inspectorView === "columns"
              ? "Column Finder"
              : "JSONPath"}
          </p>
          <button
            type="button"
            onClick={() => setInspectorView("none")}
            className="rounded-sm border-[0.5px] border-ui-border bg-obsidian-base px-2 py-1 text-[11px] font-semibold text-on-surface-variant transition-colors hover:border-ui-border-hover hover:text-text-primary focus-visible:border-copper-accent focus-visible:outline-none"
          >
            Close
          </button>
        </div>
        {!source.trim() ? (
          <div className="flex min-h-[420px] flex-1 items-center justify-center p-6">
            <div className="w-full max-w-[320px] space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[12px] bg-surface-container-low">
                <Braces className="size-7 text-copper-accent" />
              </div>
              <h3 className="text-[16px] font-medium text-text-secondary">
                Paste your JSON to get started
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void onPaste()}
                  className="h-10 rounded-[8px] bg-copper-accent px-4 text-[14px] font-semibold text-white transition-colors hover:opacity-90 focus-visible:outline-none"
                >
                  Paste from clipboard
                </button>
                <button
                  type="button"
                  onClick={onLoadSample}
                  className="h-10 rounded-[8px] border-[0.5px] border-ui-border bg-surface-elevated px-4 text-[14px] font-medium text-text-primary transition-colors hover:border-ui-border-hover focus-visible:border-copper-accent focus-visible:outline-none"
                >
                  Load sample JSON
                </button>
                <button
                  type="button"
                  onClick={onFetchFromUrl}
                  className="h-10 rounded-[8px] px-4 text-[14px] font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:text-text-primary focus-visible:outline-none"
                >
                  Fetch from URL
                </button>
              </div>
            </div>
          </div>
        ) : inspectorView === "status" ? (
          <>
            <SidebarSection title="Status">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-sm border px-4 py-4",
                  parseResult?.valid
                    ? "border-emerald-500/20 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                    : "border-red-500/20 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400",
                )}
              >
                {parseResult?.valid ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <XCircle className="size-5" />
                )}
                <span className="text-[14px] font-semibold">
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
                    action={{ label: "Redact sensitive fields", onClick: handleRedactSensitive }}
                  />
                ) : null}
                {intelligentIssues.warning ? (
                  <IssueCard
                    tone="warning"
                    icon={<Info className="size-4" />}
                    title="Type mismatch suggestion"
                    body={intelligentIssues.warning}
                    action={{ label: "Auto-fix type mismatch", onClick: handleAutoFix }}
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

            <div className="border-b-[0.5px] border-ui-border p-5">
              <button
                type="button"
                onClick={() => setShowStats(!showStats)}
                className="flex w-full items-center justify-between text-left focus-visible:outline-none"
              >
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary/80">
                  Document Stats
                </h3>
                <span className="text-[11px] font-semibold text-copper-accent hover:text-copper-accent/80 transition-colors">
                  {showStats ? "Collapse" : "Expand"}
                </span>
              </button>
              {showStats ? (
                <div className="mt-4">
                  <StatsGrid stats={stats} />
                </div>
              ) : null}
            </div>
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
                <div className="overflow-hidden rounded-[6px] border-[0.5px] border-ui-border bg-obsidian-base">
                  <div className="flex h-[34px] items-center gap-2 border-b-[0.5px] border-ui-border px-3">
                    <Search className="size-[14px] shrink-0 text-outline-variant" />
                    <input
                      value={treeSearchTerm}
                      onChange={(event) => setTreeSearchTerm(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          navigateTreeMatch(event.shiftKey ? "previous" : "next");
                        }
                      }}
                      placeholder="Search keys, values, paths..."
                      className="w-full bg-transparent font-mono text-[12px] text-text-primary outline-none placeholder:text-outline-variant"
                    />
                    {treeSearchTerm.trim() && treeSearchMatches.length ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigateTreeMatch("previous")}
                          className="inline-flex h-5 w-5 items-center justify-center text-outline-variant transition-colors hover:text-text-primary focus-visible:text-text-primary focus-visible:outline-none"
                          aria-label="Previous tree match"
                        >
                          <ChevronLeft className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTreeMatch("next")}
                          className="inline-flex h-5 w-5 items-center justify-center text-outline-variant transition-colors hover:text-text-primary focus-visible:text-text-primary focus-visible:outline-none"
                          aria-label="Next tree match"
                        >
                          <ChevronRight className="size-3.5" />
                        </button>
                      </div>
                    ) : null}
                    {treeSearchTerm.trim() ? (
                      <button
                        type="button"
                        onClick={() => setTreeSearchTerm("")}
                        className="inline-flex h-5 w-5 items-center justify-center text-outline-variant transition-colors hover:text-text-primary focus-visible:text-text-primary focus-visible:outline-none"
                        aria-label="Clear tree search"
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : null}
                    <span className="shrink-0 font-mono text-[10px] text-outline-variant">
                      {treeSearchTerm.trim()
                        ? `${activeTreeMatchNumber} of ${treeSearchMatches.length}`
                        : ""}
                    </span>
                  </div>
                </div>

                <p className="text-[13px] font-normal leading-[1.6] text-text-secondary">
                  Click any node to reveal its JSONPath and copy its value.
                </p>
                <div
                  ref={setTreeContainerElement}
                  className="overflow-x-auto rounded-sm border-[0.5px] border-ui-border bg-obsidian-base p-3"
                >
                  {treeSearchTerm.trim() && !treeSearchMatches.length ? (
                    <div className="flex min-h-[180px] items-center justify-center text-center text-[13px] text-outline-variant">
                      No matches for this search
                    </div>
                  ) : (
                    <div className="min-w-max">
                      <TreeNode
                        label="root"
                        path="$"
                        value={parseResult.data}
                        selectedPath={selectedNode?.path ?? null}
                        onSelect={setSelectedPath}
                        onCopy={onCopy}
                        treeSearchTerm={treeSearchTerm}
                        treeMatchPaths={treeMatchPaths}
                        activeMatchPath={selectedNode?.path ?? null}
                      />
                    </div>
                  )}
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
                  <p className="text-[13px] font-normal leading-[1.6] text-[#8B92A8]">
                    {searchMatches.length} matches found
                  </p>
                  {searchMatches.slice(0, 8).map((match) => (
                    <button
                      key={match.path}
                      type="button"
                      onClick={() => {
                        setInspectorView("tree");
                        setSelectedPath(match.path);
                      }}
                      className="w-full rounded-sm border-[0.5px] border-ui-border bg-obsidian-base px-3 py-3 text-left transition-colors hover:border-ui-border-hover focus-visible:border-copper-accent focus-visible:outline-none"
                    >
                      <p className="font-mono text-[13px] font-normal text-text-primary">
                        {match.path}
                      </p>
                      <p className="mt-1 text-[13px] font-normal leading-[1.6] text-text-secondary">
                        {match.preview}
                      </p>
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
                <p className="text-[13px] font-normal leading-[1.6] text-text-secondary">
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

        {inspectorView === "jsonpath" ? (
          <SidebarSection title="JSONPath">
            {parseResult?.valid ? (
              <div className="space-y-3">
                <div className="rounded-[6px] border-[0.5px] border-ui-border bg-obsidian-base p-3">
                  <input
                    value={jsonPathQuery}
                    onChange={(event) => setJsonPathQuery(event.target.value)}
                    placeholder="$.store.books[*].title"
                    className="h-12 w-full rounded-[6px] border-[0.5px] border-ui-border bg-surface-elevated px-3 font-mono text-[13px] text-text-primary outline-none placeholder:text-outline-variant focus-visible:border-copper-accent"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-outline-variant">
                    {jsonPathExamples.map((example, index) => (
                      <React.Fragment key={example}>
                        <button
                          type="button"
                          onClick={() => setJsonPathQuery(example)}
                          className="font-mono transition-colors hover:text-copper-accent focus-visible:text-copper-accent focus-visible:outline-none"
                        >
                          {example}
                        </button>
                        {index < jsonPathExamples.length - 1 ? <span>·</span> : null}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="rounded-[6px] border-[0.5px] border-ui-border bg-obsidian-base p-3">
                  {jsonPathState.error ? (
                    <div className="rounded-[6px] border-[0.5px] border-[#FF5C6C] bg-[#2A0D10] px-4 py-3">
                      <p className="text-[13px] font-medium text-[#FF5C6C]">
                        Invalid JSONPath query
                      </p>
                      <p className="mt-1 text-[13px] font-normal leading-[1.6] text-[#FFB3BD]">
                        {jsonPathState.error}
                      </p>
                    </div>
                  ) : jsonPathQuery.trim() ? (
                    jsonPathState.matches.length ? (
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <span className="rounded-[6px] bg-[#1F140C] px-2.5 py-1 text-[11px] font-medium text-[#C07040]">
                            {jsonPathState.matches.length} results
                          </span>
                        </div>

                        <div className="space-y-3">
                          {jsonPathState.matches.map((match) => (
                            <button
                              key={match.path}
                              type="button"
                              onClick={() => setSelectedPath(match.path)}
                              className="block w-full rounded-[6px] border-[0.5px] border-ui-border bg-surface-elevated p-3 text-left transition-colors hover:border-ui-border-hover focus-visible:border-copper-accent focus-visible:outline-none"
                            >
                              <p className="font-mono text-[13px] text-copper-accent">{match.path}</p>
                              <CodePreview
                                value={JSON.stringify(match.value, null, 2)}
                                className="mt-2 border-0 bg-transparent p-0 text-text-primary"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-[180px] items-center justify-center text-center text-[13px] text-outline-variant">
                        No matches for this path
                      </div>
                    )
                  ) : (
                    <div className="flex min-h-[180px] items-center justify-center text-center text-[13px] text-outline-variant">
                      Enter a JSONPath query to inspect matching values.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <SidebarEmpty text="Valid JSON is required before JSONPath queries can run." />
            )}
          </SidebarSection>
        ) : null}

        {inspectorView === "columns" ? (
          <SidebarSection title="Column Finder">
            {parseResult?.valid ? (
              <div className="space-y-3">
                <p className="text-[13px] font-normal leading-[1.6] text-[#8B92A8]">
                  Traverse nested arrays and objects using a macOS Finder-style multi-column drilldown.
                </p>
                <div className="h-[480px] min-h-[380px]">
                  <ColumnView
                    value={parseResult.data}
                    onSelectNode={(path) => setSelectedPath(path)}
                  />
                </div>
              </div>
            ) : (
              <SidebarEmpty text="Valid JSON will appear as columns here." />
            )}
          </SidebarSection>
        ) : null}
      </aside>
    ) : null;

  return (
    <div
      className={cn(
        "grid h-full min-h-0",
        inspectorView === "none"
          ? "grid-cols-1"
          : (inspectorView === "graph" || inspectorView === "columns")
          ? "grid-cols-1 xl:grid-cols-2"
          : "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]",
      )}
    >
      {showMobileGraphPanel ? (
        inspectorPane
      ) : (
        <>
          {editorPane}
          {inspectorPane}
        </>
      )}
    </div>
  );
}
