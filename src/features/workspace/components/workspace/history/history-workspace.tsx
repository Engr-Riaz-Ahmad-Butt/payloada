"use client";

import type { HistoryItem } from "../core/types";

export function HistoryWorkspace({ items }: { items: HistoryItem[] }) {
  return (
    <div className="grid h-full min-h-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="border-r border-[#262626] p-5">
        <div className="rounded-sm border border-[#262626] bg-[#0a0a0a] p-5">
          <h3 className="text-lg font-semibold text-[#f5f1ea]">Workspace history</h3>
          <p className="mt-2 text-sm text-[#a89589]">
            Track recent actions like formatting, downloads, masking, and converter output
            generation.
          </p>
        </div>
      </div>

      <aside className="overflow-y-auto bg-[#121212] p-5">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-sm border border-[#262626] bg-[#0a0a0a] px-4 py-4"
            >
              <p className="text-sm font-semibold text-[#f5f1ea]">{item.label}</p>
              <p className="mt-1 text-sm text-[#a89589]">{item.detail}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
