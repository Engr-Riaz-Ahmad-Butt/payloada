"use client";

import React from "react";
import { ChevronRight, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export function CommandPalette({
  items,
  activeIndex,
  query,
  inputRef,
  onClose,
  onMoveDown,
  onMoveUp,
  onQueryChange,
  onRun,
  onSelect,
}: {
  items: ReadonlyArray<{ id: string; label: string; hint: string }>;
  activeIndex: number;
  query: string;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onClose: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onQueryChange: (value: string) => void;
  onRun: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-[12vh] w-full max-w-2xl rounded-[20px] border border-[#2b2b2b] bg-[#101010] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[#262626] px-5 py-4">
          <div className="flex items-center gap-3">
            <Search className="size-4 text-[#d69463]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  onMoveDown();
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  onMoveUp();
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  onRun();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  onClose();
                }
              }}
              className="w-full bg-transparent text-sm text-[#f5f1ea] outline-none placeholder:text-[#5b5450]"
              placeholder="Search commands..."
            />
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {items.length ? (
            items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-4 py-3 text-left transition-colors",
                  activeIndex === index ? "bg-[#1d1d1d]" : "hover:bg-[#171717]",
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-[#f5f1ea]">{item.label}</p>
                  <p className="text-xs text-[#a89589]">{item.hint}</p>
                </div>
                <ChevronRight className="size-4 text-[#7b7068]" />
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-[#a89589]">No matching commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
