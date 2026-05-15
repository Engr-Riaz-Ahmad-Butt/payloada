"use client";

import { Braces, CheckCircle2, Download, GitBranch, List, Search } from "lucide-react";

import { cn } from "@/lib/utils";

import { ROLE_MODES } from "../core/constants";
import { IconButton } from "../shared";
import type { InspectorView, RoleMode } from "../core/types";

export function WorkspaceModeStrip({
  roleMode,
  setRoleMode,
  inspectorView,
  setInspectorView,
  onDownload,
}: {
  roleMode: RoleMode;
  setRoleMode: (mode: RoleMode) => void;
  inspectorView: InspectorView;
  setInspectorView: (view: InspectorView) => void;
  onDownload: () => void;
}) {
  return (
    <div className="border-b border-[#262626] px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
        <div className="flex flex-wrap gap-4 text-[14px] font-semibold sm:gap-6 sm:text-[15px]">
          {ROLE_MODES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRoleMode(item)}
              className={cn(
                "border-b pb-1 transition-colors",
                roleMode === item
                  ? "border-[#c07040] text-[#d69463]"
                  : "border-transparent text-[#d6c3b5] hover:text-[#f5f1ea]",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex w-full items-center gap-1 overflow-x-auto rounded-sm border border-[#2b2b2b] bg-[#0f0f0f] p-1 xl:w-auto">
          <IconButton
            active={inspectorView === "formatted"}
            icon={<List className="size-4" />}
            onClick={() => setInspectorView("formatted")}
            title="Formatted view"
          />
          <IconButton
            active={inspectorView === "status"}
            icon={<CheckCircle2 className="size-4" />}
            onClick={() => setInspectorView("status")}
            title="Validation status"
          />
          <IconButton
            active={inspectorView === "tree"}
            icon={<Braces className="size-4" />}
            onClick={() => setInspectorView("tree")}
            title="Tree explorer"
          />
          <div className="mx-1 h-4 w-px bg-[#2f2f2f]" />
          <IconButton
            active={inspectorView === "search"}
            icon={<Search className="size-4" />}
            onClick={() => setInspectorView("search")}
            title="Search inspector"
          />
          <IconButton
            active={inspectorView === "graph"}
            icon={<GitBranch className="size-4" />}
            onClick={() => setInspectorView("graph")}
            title="Graph view"
          />
          <IconButton
            active={false}
            icon={<Download className="size-4" />}
            onClick={onDownload}
            title="Download"
          />
        </div>
      </div>
    </div>
  );
}
