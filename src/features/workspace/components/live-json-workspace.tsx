"use client";

import React from "react";

import { CommandPalette, ShareModal, ShortcutsModal } from "./workspace/shared";
import { ConverterWorkspace } from "./workspace/converters/converter-workspace";
import { DiffWorkspace } from "./workspace/diff/diff-workspace";
import { EditorWorkspace } from "./workspace/editor/editor-workspace";
import { HistoryWorkspace } from "./workspace/history/history-workspace";
import { JwtWorkspace } from "./workspace/jwt/jwt-workspace";
import { AiWorkspace } from "./workspace/ai/ai-workspace";
import { TableWorkspace } from "./workspace/table/table-workspace";
import { MockWorkspace } from "./workspace/mock/mock-workspace";
import { WorkspaceActionToolbar } from "./workspace/editor/workspace-action-toolbar";
import { WorkspaceModeStrip } from "./workspace/editor/workspace-mode-strip";
import { WorkspaceSidebar } from "./workspace/editor/workspace-sidebar";
import { WorkspaceTopbar } from "./workspace/editor/workspace-topbar";
import { useLiveJsonWorkspace } from "./workspace/core/use-live-json-workspace";
import type {
  ConverterTab,
  InspectorView,
  WorkspaceView,
} from "./workspace/core/types";

type LiveJsonWorkspaceProps = {
  initialWorkspaceView?: WorkspaceView;
  initialInspectorView?: InspectorView;
  initialConverterTab?: ConverterTab;
};

export function LiveJsonWorkspace({
  initialWorkspaceView,
  initialInspectorView,
  initialConverterTab,
}: LiveJsonWorkspaceProps = {}) {
  const { refs, state, derived, actions } = useLiveJsonWorkspace({
    initialWorkspaceView,
    initialInspectorView,
    initialConverterTab,
  });
  const { editorRef, fileInputRef, commandInputRef } = refs;
  const {
    workspaceView,
    isSidebarCollapsed,
    roleMode,
    inspectorView,
    source,
    searchTerm,
    urlValue,
    showUrlInput,
    showCommandPalette,
    showShortcutsModal,
    showShareModal,
    commandQuery,
    commandIndex,
    linePosition,
    historyItems,
    diffOld,
    diffNew,
    converterTab,
    jwtInput,
    isParsing,
  } = state;
  const {
    parseResult,
    parsedValue,
    stats,
    formattedOutput,
    searchMatches,
    selectedNode,
    intelligentIssues,
    converterOutput,
    diffSummary,
    decodedJwt,
    filteredCommands,
  } = derived;
  const {
    setRoleMode,
    setInspectorView,
    setSource,
    setSelectedPath,
    setSearchTerm,
    setUrlValue,
    setShowUrlInput,
    setShowCommandPalette,
    setShowShortcutsModal,
    setShowShareModal,
    setCommandQuery,
    setCommandIndex,
    setLinePosition,
    setDiffOld,
    setDiffNew,
    setConverterTab,
    setJwtInput,
    setIsSidebarCollapsed,
    openWorkspace,
    openConverterWorkspace,
    clearHistory,
    handleCopy,
    handleDownload,
    handlePaste,
    handleUpload,
    handleFormat,
    handleMinify,
    handleRepair,
    handleSortKeys,
    handleLoadUrl,
    handleRunCommand,
    clearEditor,
    loadSampleJson,
    activateSearch,
    activateTreeInspector,
    handleNewDocument,
  } = actions;

  return (
    <section className="overflow-hidden border-[0.5px] border-ui-border bg-obsidian-base text-text-primary">
      <div
        className="grid min-h-screen xl:min-h-230 xl:grid-cols-(--sidebar-columns) xl:transition-[grid-template-columns] xl:duration-500 xl:ease-[cubic-bezier(0.77,0,0.18,1)]"
        style={
          {
            "--sidebar-columns": isSidebarCollapsed ? "88px minmax(0,1fr)" : "260px minmax(0,1fr)",
          } as React.CSSProperties
        }
      >
        <WorkspaceSidebar
          workspaceView={workspaceView}
          onOpenWorkspace={openWorkspace}
          onNewDocument={handleNewDocument}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        />

        <div className="flex min-w-0 flex-col">
          <WorkspaceTopbar
            workspaceView={workspaceView}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activateSearch={activateSearch}
            onOpenShortcuts={() => setShowShortcutsModal(true)}
            onOpenShare={() => setShowShareModal(true)}
          />

          <div className="flex min-h-0 flex-1 flex-col bg-surface">
            {workspaceView === "editor" ? (
              <WorkspaceModeStrip
                roleMode={roleMode}
                setRoleMode={setRoleMode}
                inspectorView={inspectorView}
                setInspectorView={setInspectorView}
                onDownload={() => handleDownload(formattedOutput || source, "jsonova-output.txt")}
              />
            ) : null}

            {workspaceView === "editor" ? (
              <WorkspaceActionToolbar
                fileInputRef={fileInputRef}
                onPaste={handlePaste}
                onUploadClick={() => fileInputRef.current?.click()}
                onLoadUrlToggle={() => setShowUrlInput((value) => !value)}
                onTrySample={loadSampleJson}
                onUpload={handleUpload}
                onFormat={handleFormat}
                onMinify={handleMinify}
                onRepair={handleRepair}
                onSort={handleSortKeys}
                onOpenConverters={() => openConverterWorkspace()}
                onJsonPath={activateTreeInspector}
              />
            ) : null}

            {workspaceView === "editor" && showUrlInput ? (
              <div className="flex flex-col gap-3 border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                <input
                  value={urlValue}
                  onChange={(event) => setUrlValue(event.target.value)}
                  placeholder="https://api.example.com/users"
                  className="h-10 w-full flex-1 rounded-sm border-[0.5px] border-ui-border bg-obsidian-base px-3 text-sm text-text-primary outline-none placeholder:text-outline-variant focus-visible:border-[#C07040]"
                />
                <button
                  className="rounded-sm border-[0.5px] border-ui-border bg-[#c77742] px-4 py-2 text-sm font-semibold text-black transition-colors hover:border-[#2A2F42] focus-visible:border-[#C07040] focus-visible:outline-none sm:shrink-0"
                  onClick={handleLoadUrl}
                >
                  Fetch JSON
                </button>
              </div>
            ) : null}

            <div className="min-h-0 flex-1">
              {workspaceView === "editor" ? (
                <EditorWorkspace
                  source={source}
                  setSource={setSource}
                  parseResult={parseResult}
                  formattedOutput={formattedOutput}
                  stats={stats}
                  inspectorView={inspectorView}
                  setInspectorView={setInspectorView}
                  intelligentIssues={intelligentIssues}
                  searchTerm={searchTerm}
                  searchMatches={searchMatches}
                  selectedNode={selectedNode}
                  setSelectedPath={setSelectedPath}
                  onCopy={handleCopy}
                  editorRef={editorRef}
                  linePosition={linePosition}
                  setLinePosition={setLinePosition}
                  onClear={clearEditor}
                  onPaste={handlePaste}
                  onLoadSample={loadSampleJson}
                  onFetchFromUrl={() => setShowUrlInput(true)}
                  isParsing={isParsing}
                />
              ) : null}

              {workspaceView === "converters" ? (
                <ConverterWorkspace
                  converterTab={converterTab}
                  setConverterTab={setConverterTab}
                  output={converterOutput}
                  parsedValue={parsedValue}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  source={source}
                  setSource={setSource}
                />
              ) : null}

              {workspaceView === "diff" ? (
                <DiffWorkspace
                  diffNew={diffNew}
                  diffOld={diffOld}
                  setDiffNew={setDiffNew}
                  setDiffOld={setDiffOld}
                  summary={diffSummary}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              ) : null}

              {workspaceView === "jwt" ? (
                <JwtWorkspace
                  jwtInput={jwtInput}
                  setJwtInput={setJwtInput}
                  decodedJwt={decodedJwt}
                  onCopy={handleCopy}
                />
              ) : null}

              {workspaceView === "ai" ? (
                <AiWorkspace source={source} onSendToEditor={setSource} onCopy={handleCopy} />
              ) : null}

              {workspaceView === "table" ? (
                <TableWorkspace
                  parsedValue={parsedValue}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              ) : null}

              {workspaceView === "mock" ? (
                <MockWorkspace
                  onSendToEditor={(value) => {
                    setSource(value);
                    openWorkspace("editor");
                  }}
                  onCopy={handleCopy}
                />
              ) : null}

              {workspaceView === "history" ? (
                <HistoryWorkspace items={historyItems} onClear={clearHistory} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showCommandPalette ? (
        <CommandPalette
          items={filteredCommands}
          activeIndex={commandIndex}
          query={commandQuery}
          inputRef={commandInputRef}
          onClose={() => setShowCommandPalette(false)}
          onMoveDown={() =>
            setCommandIndex((current) =>
              Math.min(current + 1, Math.max(filteredCommands.length - 1, 0)),
            )
          }
          onMoveUp={() => setCommandIndex((current) => Math.max(current - 1, 0))}
          onQueryChange={setCommandQuery}
          onRun={() => handleRunCommand(filteredCommands[commandIndex]?.id ?? "")}
          onSelect={(id) => handleRunCommand(id)}
        />
      ) : null}

      {showShortcutsModal ? <ShortcutsModal onClose={() => setShowShortcutsModal(false)} /> : null}
      {showShareModal ? (
        <ShareModal source={source} onClose={() => setShowShareModal(false)} onCopy={handleCopy} />
      ) : null}
    </section>
  );
}
