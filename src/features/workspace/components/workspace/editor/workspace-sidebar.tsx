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
    <aside className="flex min-h-full flex-col border-r border-ui-border bg-surface-elevated px-5 py-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#1f1f1f]">
          <Braces className="size-5 text-[#c07040]" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold tracking-tight text-copper-accent">jsonLines</h2>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#d6c3b5]">
            Pro Workspace
          </p>
        </div>
      </div>

      <button className="mb-7 rounded-sm bg-[#c77742] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90">
        + New Document
      </button>

      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = workspaceView === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onOpenWorkspace(id)}
              className={cn(
                "flex w-full items-center gap-4 rounded-sm px-4 py-3 text-left transition-colors",
                active
                  ? "border-r-2 border-copper-accent bg-surface-container-high text-copper-accent"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-text-primary",
              )}
            >
              <Icon className="size-5" />
              <span className="text-[15px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 space-y-1.5 border-t border-ui-border pt-6">
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
