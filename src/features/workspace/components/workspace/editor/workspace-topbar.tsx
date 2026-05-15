"use client";

import { Search } from "lucide-react";

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
    description: "Format, validate, explore, and convert JSON in one place.",
  },
  jwt: {
    title: "JWT Decoder",
    description: "Decode token headers, payload claims, and verify supported signatures.",
  },
  diff: {
    title: "JSON Diff",
    description: "Compare original and modified payloads with a readable summary.",
  },
  converters: {
    title: "Converters",
    description: "Generate TypeScript, Zod, YAML, CSV, XML, and schema output from JSON.",
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
}: {
  workspaceView: WorkspaceView;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activateSearch: () => void;
}) {
  const workspaceMeta = WORKSPACE_TITLES[workspaceView];

  return (
    <header className="flex flex-col gap-4 border-b border-ui-border bg-obsidian-base px-4 py-4 sm:px-5 lg:px-8 xl:px-10">
      <div>
        <p className="text-lg font-semibold text-text-primary">{workspaceMeta.title}</p>
        <p className="mt-1 text-sm text-on-surface-variant">{workspaceMeta.description}</p>
      </div>

      {workspaceView === "editor" ? (
        <div className="flex min-w-0 items-center gap-3 rounded-sm border border-ui-border bg-[#101010] px-3 py-3 sm:gap-4">
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
