"use client";

import React from "react";

import { CommandPalette } from "./workspace/shared/command-palette";
import { ConverterWorkspace } from "./workspace/converters/converter-workspace";
import { DiffWorkspace } from "./workspace/diff/diff-workspace";
import { EditorWorkspace } from "./workspace/editor/editor-workspace";
import { HistoryWorkspace } from "./workspace/history/history-workspace";
import { JwtWorkspace } from "./workspace/jwt/jwt-workspace";
import { WorkspaceActionToolbar } from "./workspace/editor/workspace-action-toolbar";
import { WorkspaceModeStrip } from "./workspace/editor/workspace-mode-strip";
import { WorkspaceSidebar } from "./workspace/editor/workspace-sidebar";
import { WorkspaceTopbar } from "./workspace/editor/workspace-topbar";
import { useLiveJsonWorkspace } from "./workspace/core/use-live-json-workspace";

export function LiveJsonWorkspace() {
  const { refs, state, derived, actions } = useLiveJsonWorkspace();
  const { editorRef, fileInputRef, commandInputRef } = refs;
  const {
    workspaceView,
    previousWorkspaceView,
    roleMode,
    inspectorView,
    source,
    searchTerm,
    urlValue,
    showUrlInput,
    showCommandPalette,
    commandQuery,
    commandIndex,
    linePosition,
    historyItems,
    diffOld,
    diffNew,
    converterTab,
    jwtInput,
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
    roleModeInfo,
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
    setCommandQuery,
    setCommandIndex,
    setLinePosition,
    setDiffOld,
    setDiffNew,
    setConverterTab,
    setJwtInput,
    openWorkspace,
    openConverterWorkspace,
    handleRoleAction,
    handleCopy,
    handleDownload,
    handlePaste,
    handleUpload,
    handleFormat,
    handleMinify,
    handleRepair,
    handleLoadUrl,
    handleRunCommand,
    clearEditor,
    loadSampleJson,
    activateSearch,
    activateTreeInspector,
  } = actions;

  return (
    <section className="overflow-hidden border border-ui-border bg-obsidian-base text-text-primary shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="grid min-h-screen xl:min-h-230 xl:grid-cols-[260px_minmax(0,1fr)]">
        <WorkspaceSidebar workspaceView={workspaceView} onOpenWorkspace={openWorkspace} />

        <div className="flex min-w-0 flex-col">
          <WorkspaceTopbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activateSearch={activateSearch}
          />

          <div className="flex min-h-0 flex-1 flex-col bg-surface">
            <WorkspaceModeStrip
              roleMode={roleMode}
              setRoleMode={setRoleMode}
              inspectorView={inspectorView}
              setInspectorView={setInspectorView}
              roleModeInfo={roleModeInfo}
              handleRoleAction={handleRoleAction}
              onDownload={() =>
                handleDownload(
                  workspaceView === "converters" ? converterOutput : formattedOutput || source,
                  "jsonlines-output.txt",
                )
              }
            />

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
              onOpenConverters={() => openConverterWorkspace()}
              onJsonPath={activateTreeInspector}
            />

            {showUrlInput ? (
              <div className="flex flex-col gap-3 border-b border-ui-border bg-surface-elevated px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                <input
                  value={urlValue}
                  onChange={(event) => setUrlValue(event.target.value)}
                  placeholder="https://api.example.com/users"
                  className="h-10 w-full flex-1 rounded-sm border border-surface-container-high bg-obsidian-base px-3 text-sm text-text-primary outline-none placeholder:text-outline-variant"
                />
                <button
                  className="rounded-sm bg-[#c77742] px-4 py-2 text-sm font-semibold text-black sm:shrink-0"
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
                  onBack={() => openWorkspace(previousWorkspaceView)}
                  onClose={() => openWorkspace(previousWorkspaceView)}
                />
              ) : null}

              {workspaceView === "diff" ? (
                <DiffWorkspace
                  diffNew={diffNew}
                  diffOld={diffOld}
                  setDiffNew={setDiffNew}
                  setDiffOld={setDiffOld}
                  summary={diffSummary}
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

              {workspaceView === "history" ? <HistoryWorkspace items={historyItems} /> : null}
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
    </section>
  );
}
