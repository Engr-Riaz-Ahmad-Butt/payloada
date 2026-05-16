"use client";

import { Braces, ChevronLeft, ChevronRight, HelpCircle, Plus, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "../core/constants";
import type { WorkspaceView } from "../core/types";

export function WorkspaceSidebar({
  workspaceView,
  onOpenWorkspace,
  onNewDocument,
  isCollapsed,
  onToggleCollapse,
}: {
  workspaceView: WorkspaceView;
  onOpenWorkspace: (view: WorkspaceView) => void;
  onNewDocument: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <aside
      className={cn(
        "relative border-b border-ui-border bg-surface-elevated xl:flex xl:min-h-full xl:flex-col xl:border-b-0 xl:border-r xl:py-6 xl:transition-[padding] xl:duration-300 xl:ease-out",
        isCollapsed ? "xl:px-3" : "xl:px-5",
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "hidden xl:flex xl:absolute xl:top-6 xl:right-0 xl:z-20 xl:h-10 xl:w-10 xl:translate-x-1/2 xl:items-center xl:justify-center xl:rounded-full xl:border xl:border-[#3a2b22] xl:bg-[#17110d] xl:text-[#d6c3b5] xl:shadow-[0_14px_34px_rgba(0,0,0,0.35)] xl:transition-all xl:duration-300 xl:ease-out xl:hover:border-[#c07040] xl:hover:bg-[#221710] xl:hover:text-[#f5f1ea]",
          isCollapsed && "xl:bg-[#1d1410] xl:text-[#ffb68e]",
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      <div
        className={cn(
          "flex flex-col gap-4 px-4 py-4 sm:px-5 xl:mb-8 xl:px-0 xl:py-0",
          isCollapsed && "xl:gap-3",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            isCollapsed ? "xl:flex-col xl:items-center" : "xl:block",
          )}
        >
          <div className={cn("flex items-center gap-3", isCollapsed && "xl:flex-col")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#1f1f1f]">
              <Braces className="size-5 text-[#c07040]" />
            </div>
            {!isCollapsed ? (
              <div>
                <h2 className="text-[17px] font-bold tracking-tight text-copper-accent">
                  jsonLines
                </h2>
                <p className="text-[12px] font-medium tracking-[0.02em] text-[#d6c3b5]">
                  Pro Workspace
                </p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onNewDocument}
            className="rounded-sm bg-[#c77742] px-3 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 sm:px-4 sm:py-2.5 sm:text-sm xl:hidden"
          >
            + New Document
          </button>
        </div>

        <div
          className={cn(
            "hidden xl:flex",
            isCollapsed ? "xl:flex-col xl:items-center xl:gap-3" : "xl:block",
          )}
        >
          <button
            title="New document"
            type="button"
            onClick={onNewDocument}
            className={cn(
              "group relative rounded-sm bg-[#c77742] text-sm font-semibold text-black transition-all duration-300 ease-out hover:opacity-90",
              isCollapsed
                ? "flex h-10 w-10 items-center justify-center px-0"
                : "flex w-full items-center justify-center gap-2.5 px-4 py-3",
            )}
          >
            <Plus className="size-4 shrink-0" />
            {!isCollapsed ? <span className="whitespace-nowrap leading-none">New document</span> : null}
            {isCollapsed ? (
              <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-[#3a2b22] bg-[#17110d] px-3 py-2 text-xs font-semibold text-[#f5f1ea] shadow-[0_12px_30px_rgba(0,0,0,0.35)] group-hover:flex">
                New document
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <nav
        className={cn(
          "grid grid-cols-2 gap-2 px-4 pb-4 sm:flex sm:overflow-x-auto sm:px-5 sm:pb-4 xl:flex-1 xl:overflow-visible xl:px-0 xl:pb-0",
          isCollapsed ? "xl:flex-col xl:gap-2" : "xl:flex-col xl:gap-1.5",
        )}
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = workspaceView === id;

          return (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => onOpenWorkspace(id)}
              className={cn(
                "group relative flex min-w-0 items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-all duration-300 ease-out sm:shrink-0 xl:w-full xl:py-3",
                isCollapsed ? "xl:justify-center xl:px-0" : "xl:gap-4 xl:px-4",
                active
                  ? "border-r-2 border-copper-accent bg-surface-container-high text-copper-accent"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-text-primary",
              )}
            >
              <Icon className="size-4 xl:size-5" />
              {!isCollapsed ? (
                <span className="truncate text-sm font-medium xl:text-[15px]">{label}</span>
              ) : null}
              {isCollapsed ? (
                <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-[#3a2b22] bg-[#17110d] px-3 py-2 text-xs font-semibold text-[#f5f1ea] shadow-[0_12px_30px_rgba(0,0,0,0.35)] group-hover:flex">
                  {label}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div
        className={cn(
          "hidden border-t border-ui-border pt-6 xl:mt-8 xl:block",
          isCollapsed ? "xl:space-y-2" : "xl:space-y-1.5",
        )}
      >
        {[
          { label: "Settings", icon: Settings },
          { label: "Support", icon: HelpCircle },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            title={label}
            className="group relative flex w-full items-center gap-4 rounded-sm px-4 py-3 text-left text-on-surface-variant transition-all duration-300 ease-out hover:bg-surface-container-low hover:text-text-primary"
          >
            <Icon className="size-5" />
            {!isCollapsed ? <span className="text-[15px] font-medium">{label}</span> : null}
            {isCollapsed ? (
              <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-[#3a2b22] bg-[#17110d] px-3 py-2 text-xs font-semibold text-[#f5f1ea] shadow-[0_12px_30px_rgba(0,0,0,0.35)] group-hover:flex">
                {label}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </aside>
  );
}
