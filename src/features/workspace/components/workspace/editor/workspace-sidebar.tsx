"use client";

import { Braces, HelpCircle, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "../core/constants";
import type { WorkspaceView } from "../core/types";

export function WorkspaceSidebar({
  workspaceView,
  onOpenWorkspace,
}: {
  workspaceView: WorkspaceView;
  onOpenWorkspace: (view: WorkspaceView) => void;
}) {
  return (
    <aside className="border-b border-ui-border bg-surface-elevated xl:flex xl:min-h-full xl:flex-col xl:border-b-0 xl:border-r xl:px-5 xl:py-6">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 xl:mb-8 xl:px-0 xl:py-0">
        <div className="flex items-center justify-between gap-3 xl:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#1f1f1f]">
              <Braces className="size-5 text-[#c07040]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-copper-accent">
                jsonLines
              </h2>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#d6c3b5]">
                Pro Workspace
              </p>
            </div>
          </div>

          <button className="rounded-sm bg-[#c77742] px-3 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 sm:px-4 sm:py-2.5 sm:text-sm xl:hidden">
            + New Document
          </button>
        </div>

        <button className="hidden rounded-sm bg-[#c77742] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 xl:block">
          + New Document
        </button>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 sm:px-5 xl:flex-1 xl:flex-col xl:gap-1.5 xl:overflow-visible xl:px-0 xl:pb-0">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = workspaceView === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onOpenWorkspace(id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors xl:w-full xl:gap-4 xl:px-4 xl:py-3",
                active
                  ? "border-r-2 border-copper-accent bg-surface-container-high text-copper-accent"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-text-primary",
              )}
            >
              <Icon className="size-4 xl:size-5" />
              <span className="whitespace-nowrap text-sm font-medium xl:text-[15px]">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="hidden border-t border-ui-border pt-6 xl:mt-8 xl:block xl:space-y-1.5">
        {[
          { label: "Settings", icon: Settings },
          { label: "Support", icon: HelpCircle },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex w-full items-center gap-4 rounded-sm px-4 py-3 text-left text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-text-primary"
          >
            <Icon className="size-5" />
            <span className="text-[15px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
