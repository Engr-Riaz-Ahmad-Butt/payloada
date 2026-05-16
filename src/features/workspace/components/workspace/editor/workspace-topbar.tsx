"use client";

import { CircleHelp, Search } from "lucide-react";

import type { WorkspaceView } from "../core/types";

const WORKSPACE_TITLES: Record<
  WorkspaceView,
  {
    title: string;
    description: string;
  }
> = {
  editor: {
    title: "Workspace",
    description: "Format, validate, explore, and convert JSON in one focused workspace.",
  },
  jwt: {
    title: "JWT Decoder",
    description: "Decode token headers, review payload claims, and verify supported signatures.",
  },
  diff: {
    title: "JSON Diff",
    description: "Compare original and updated payloads with a clear, readable summary.",
  },
  converters: {
    title: "Converters",
    description: "Generate TypeScript, Zod, YAML, CSV, XML, and schema output from valid JSON.",
  },
  history: {
    title: "History",
    description: "Review recent formatting, downloads, diff checks, and conversion activity.",
  },
};

export function WorkspaceTopbar({
  workspaceView,
  searchTerm,
  setSearchTerm,
  activateSearch,
  onOpenShortcuts,
  onOpenShare,
}: {
  workspaceView: WorkspaceView;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activateSearch: () => void;
  onOpenShortcuts: () => void;
  onOpenShare: () => void;
}) {
  const workspaceMeta = WORKSPACE_TITLES[workspaceView];

  return (
    <header className="flex flex-col gap-4 border-b-[0.5px] border-ui-border bg-obsidian-base px-4 py-4 sm:px-5 lg:px-8 xl:px-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-text-primary">{workspaceMeta.title}</p>
          <p className="mt-1 text-sm text-on-surface-variant">{workspaceMeta.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenShare}
            className="inline-flex h-9 items-center justify-center rounded-sm border-[0.5px] border-ui-border bg-[#101010] px-3 text-[12px] font-medium text-[#E8EAF0] transition-colors hover:border-[#2A2F42] focus-visible:border-[#C07040] focus-visible:outline-none"
          >
            Share
          </button>
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-[0.5px] border-ui-border bg-[#101010] text-[#8B92A8] transition-colors hover:border-[#2A2F42] hover:text-[#E8EAF0] focus-visible:border-[#C07040] focus-visible:outline-none"
            aria-label="Open keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            <CircleHelp className="size-4" />
          </button>
        </div>
      </div>

      {workspaceView === "editor" ? (
        <div className="flex min-w-0 items-center gap-3 rounded-sm border-[0.5px] border-ui-border bg-[#101010] px-3 py-3 sm:gap-4">
          <Search className="size-5 shrink-0 text-[#d6c3b5]" />
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              activateSearch();
            }}
            onFocus={activateSearch}
            placeholder="Search files, actions, or data..."
            className="w-full bg-transparent text-[15px] text-text-primary outline-none placeholder:text-outline-variant"
          />
        </div>
      ) : null}
    </header>
  );
}
