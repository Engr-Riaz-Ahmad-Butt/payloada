/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

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
        "relative hidden xl:flex xl:h-full xl:flex-col xl:overflow-visible xl:border-b-0 xl:border-r-[0.5px] xl:border-ui-border xl:bg-surface-elevated xl:py-6 xl:transition-[padding] xl:duration-300 xl:ease-out",
        isCollapsed ? "xl:px-3" : "xl:px-5",
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "hidden xl:flex xl:absolute xl:top-6 xl:right-0 xl:z-20 xl:h-10 xl:w-10 xl:translate-x-1/2 xl:items-center xl:justify-center xl:rounded-full xl:border-[0.5px] xl:border-ui-border xl:bg-surface-container-low xl:text-on-surface-variant xl:transition-all xl:duration-300 xl:ease-out xl:hover:border-ui-border-hover xl:hover:bg-surface-container xl:hover:text-text-primary xl:focus-visible:border-copper-accent xl:focus-visible:outline-none",
          isCollapsed && "xl:bg-surface-container xl:text-copper-accent",
        )}
      >
        {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-surface-container-low overflow-hidden border-[0.5px] border-ui-border/50">
              <img src="/payloada-logo-icon.svg" alt="Payloada" className="h-full w-full object-contain p-1.5" />
            </div>
            {!isCollapsed ? (
              <div>
                <h2 className="text-[17px] font-bold tracking-tight text-copper-accent">
                  Payloada
                </h2>
                <p className="text-[12px] font-medium tracking-[0.02em] text-on-surface-variant">
                  Developer Workspace
                </p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onNewDocument}
            className="rounded-sm border-[0.5px] border-copper-accent bg-copper-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-ui-border-hover hover:opacity-90 sm:px-4 sm:py-2.5 sm:text-sm xl:hidden"
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
              "group relative rounded-sm border-[0.5px] border-copper-accent bg-copper-accent text-sm font-semibold text-white transition-all duration-300 ease-out hover:border-ui-border-hover hover:opacity-90",
              isCollapsed
                ? "flex h-10 w-10 items-center justify-center px-0"
                : "flex w-full items-center justify-center gap-2.5 px-4 py-3",
            )}
          >
            <Plus className="size-4 shrink-0" />
            {!isCollapsed ? (
              <span className="whitespace-nowrap leading-none">New document</span>
            ) : null}
            {isCollapsed ? (
              <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border-[0.5px] border-ui-border bg-surface-container-low px-3 py-2 text-xs font-semibold text-text-primary group-hover:flex">
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
                  : "text-on-surface-variant hover:-translate-y-px hover:bg-surface-container-low hover:text-text-primary",
              )}
            >
              <Icon className="size-4 xl:size-5" />
              {!isCollapsed ? (
                <span className="truncate text-sm font-medium xl:text-[15px]">{label}</span>
              ) : null}
              {isCollapsed ? (
                <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border-[0.5px] border-ui-border bg-surface-container-low px-3 py-2 text-xs font-semibold text-text-primary group-hover:flex">
                  {label}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
