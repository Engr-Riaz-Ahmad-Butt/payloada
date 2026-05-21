"use client";

import React from "react";
import { X } from "lucide-react";

const SHORTCUT_COLUMNS = [
  {
    title: "Editor actions",
    items: [
      ["Ctrl + Enter", "Parse / validate JSON"],
      ["Ctrl + Shift + F", "Format / beautify"],
      ["Ctrl + Shift + M", "Minify"],
      ["Ctrl + Z / Y", "Undo / Redo"],
      ["Ctrl + S", "Save to workspace"],
    ],
  },
  {
    title: "View & navigation",
    items: [
      ["Ctrl + K", "Search tree"],
      ["Escape", "Clear focus / close modal"],
      ["?", "Open this shortcuts panel"],
      ["Arrow keys", "Navigate tree nodes"],
      ["Space / Enter", "Expand / collapse tree node"],
    ],
  },
  {
    title: "Export & share",
    items: [
      ["Ctrl + C", "Copy (on node = copy node JSON)"],
      ["Ctrl + Shift + C", "Copy JSON path"],
      ["Ctrl + Shift + S", "Share - generate link"],
    ],
  },
] as const;

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[85] bg-[rgba(10,10,14,0.8)] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div
        className="mx-auto mt-[10vh] w-full max-w-[520px] rounded-[16px] border-[0.5px] border-ui-border bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-[0.5px] border-ui-border px-5 py-4">
          <h2 id="keyboard-shortcuts-title" className="text-[16px] font-semibold text-text-primary">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border-[0.5px] border-ui-border bg-surface-elevated p-2 text-text-secondary transition-colors hover:border-copper-accent hover:text-text-primary focus-visible:border-copper-accent focus-visible:outline-none"
            aria-label="Close keyboard shortcuts"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 px-5 py-5 md:grid-cols-3">
          {SHORTCUT_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="mb-3 text-[11px] font-medium tracking-[0.03em] text-text-secondary">
                {column.title}
              </p>
              <div className="space-y-2.5">
                {column.items.map(([shortcut, label]) => (
                  <div key={shortcut} className="space-y-1">
                    <span className="inline-flex rounded-[4px] border-[0.5px] border-ui-border bg-surface-elevated px-[6px] py-[2px] font-mono text-[10px] text-text-secondary">
                      {shortcut}
                    </span>
                    <p className="text-[12px] font-normal leading-[1.5] text-text-secondary">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
