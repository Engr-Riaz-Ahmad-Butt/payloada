"use client";

import { useEffect, useRef, useState } from "react";
import {
  Braces,
  CheckCircle2,
  ChevronDown,
  Download,
  GitBranch,
  List,
  Search,
  Waypoints,
} from "lucide-react";

import { ROLE_MODE_INFO, ROLE_MODES } from "../core/constants";
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
  const [showModeMenu, setShowModeMenu] = useState(false);
  const modeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!modeMenuRef.current?.contains(event.target as Node)) {
        setShowModeMenu(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="border-b-[0.5px] border-ui-border px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
        <div ref={modeMenuRef} className="relative w-full xl:w-auto">
          <button
            type="button"
            onClick={() => setShowModeMenu((current) => !current)}
            className="flex h-10 w-full items-center justify-between rounded-[10px] border-[0.5px] border-ui-border bg-[#0f0f0f] px-4 text-left transition-colors hover:border-[#2A2F42] focus-visible:border-[#C07040] focus-visible:outline-none xl:min-w-[220px]"
          >
            <div>
              <p className="text-[15px] font-medium text-[#F5F1EA]">{roleMode} mode</p>
            </div>
            <ChevronDown
              className="size-4 text-[#8B92A8] transition-transform"
              style={{ transform: showModeMenu ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {showModeMenu ? (
            <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated xl:w-[320px]">
              <div className="border-b-[0.5px] border-ui-border px-4 py-3">
                <p className="text-[11px] font-medium tracking-[0.04em] text-[#5A6070]">Mode</p>
              </div>
              <div className="p-2">
                {ROLE_MODES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setRoleMode(item);
                      setShowModeMenu(false);
                    }}
                    className="flex w-full flex-col rounded-[10px] px-3 py-3 text-left transition-colors hover:bg-surface-container-low"
                  >
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: roleMode === item ? "#C07040" : "#F5F1EA" }}
                    >
                      {item}
                    </span>
                    <span className="mt-1 text-[13px] font-normal leading-[1.5] text-[#8B92A8]">
                      {ROLE_MODE_INFO[item].description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-1 overflow-x-auto rounded-sm border-[0.5px] border-ui-border bg-[#0f0f0f] p-1 xl:w-auto">
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
          <div className="mx-1 h-4 w-px bg-ui-border" />
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
            active={inspectorView === "jsonpath"}
            icon={<Waypoints className="size-4" />}
            onClick={() => setInspectorView("jsonpath")}
            title="JSONPath"
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
