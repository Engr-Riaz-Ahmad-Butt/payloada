"use client";

import { Braces, CheckCircle2, Download, GitBranch, List, Search } from "lucide-react";

import { cn } from "@/lib/utils";

import { ROLE_MODES } from "../core/constants";
import { IconButton } from "../shared";
import type { ConverterTab, InspectorView, RoleMode, WorkspaceView } from "../core/types";

export function WorkspaceModeStrip({
  roleMode,
  setRoleMode,
  inspectorView,
  setInspectorView,
  roleModeInfo,
  handleRoleAction,
  onDownload,
}: {
  roleMode: RoleMode;
  setRoleMode: (mode: RoleMode) => void;
  inspectorView: InspectorView;
  setInspectorView: (view: InspectorView) => void;
  roleModeInfo: {
    description: string;
    actions: Array<{
      label: string;
      view: WorkspaceView;
      inspector?: InspectorView;
      converterTab?: ConverterTab;
    }>;
  };
  handleRoleAction: (action: {
    label: string;
    view: WorkspaceView;
    inspector?: InspectorView;
    converterTab?: ConverterTab;
  }) => void;
  onDownload: () => void;
}) {
  return (
    <div className="border-b border-[#262626] px-5 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-6 text-[15px] font-semibold">
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

        <div className="flex items-center gap-1 rounded-sm border border-[#2b2b2b] bg-[#0f0f0f] p-1">
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#262626] bg-[#101010] px-4 py-3">
        <div>
          <p className="text-[12px] font-semibold text-[#f5f1ea]">{roleMode} mode</p>
          <p className="mt-1 text-[13px] leading-6 text-[#a89589]">{roleModeInfo.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {roleModeInfo.actions.map((action) => (
            <button
              key={`${roleMode}-${action.label}`}
              type="button"
              onClick={() => handleRoleAction(action)}
              className="rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-[#d6c3b5] transition-colors hover:border-[#c07040]"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
