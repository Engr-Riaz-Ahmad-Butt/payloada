"use client";

import { FolderOpen, History } from "lucide-react";

import type { HistoryItem } from "../core/types";

export function HistoryWorkspace({
  items,
  onClear,
}: {
  items: HistoryItem[];
  onClear: () => void;
}) {
  return (
    <div className="grid h-full min-h-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="border-b-[0.5px] border-ui-border p-4 sm:p-5 xl:border-b-0 xl:border-r-[0.5px]">
        {items.length ? (
          <div className="rounded-sm border-[0.5px] border-ui-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Workspace history</h3>
                <p className="mt-2 text-sm text-[#a89589]">
                  Review recent actions like formatting, downloads, masking, and converter
                  generation.
                </p>
              </div>
              <button
                type="button"
                onClick={onClear}
                className="rounded-[8px] border-[0.5px] border-ui-border bg-[#1A1D24] px-3 py-2 text-[12px] font-medium text-[#8B92A8] transition-colors hover:border-[#C07040] hover:text-[#E8EAF0] focus-visible:border-[#C07040] focus-visible:outline-none"
              >
                Clear history
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded-sm border-[0.5px] border-ui-border bg-surface p-6">
            <div className="w-full max-w-[260px] space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[12px] bg-[#1A1D24]">
                <FolderOpen className="size-7 text-[#5A6070]" />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[#5A6070]">No saved snippets</p>
                <button
                  type="button"
                  className="mt-3 h-10 rounded-[8px] bg-[#C07040] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#D48050] focus-visible:outline-none"
                >
                  Save current JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="overflow-y-auto bg-surface-elevated p-4 sm:p-5">
        {items.length ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-sm border-[0.5px] border-ui-border bg-surface px-4 py-4"
              >
                <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                <p className="mt-1 text-sm text-[#a89589]">{item.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded-sm border-[0.5px] border-ui-border bg-surface p-6">
            <div className="w-full max-w-[240px] space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#1A1D24]">
                <History className="size-6 text-[#5A6070]" />
              </div>
              <p className="text-[16px] font-medium text-[#5A6070]">No parse history yet</p>
              <p className="text-[13px] leading-[1.6] text-[#3A4060]">
                Your last 50 parses will appear here.
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
