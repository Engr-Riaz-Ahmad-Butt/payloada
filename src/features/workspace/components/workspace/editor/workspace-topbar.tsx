"use client";

import { Bell, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export function WorkspaceTopbar({
  searchTerm,
  setSearchTerm,
  activateSearch,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activateSearch: () => void;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-ui-border bg-obsidian-base px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-8 xl:h-16 xl:px-10 xl:py-0">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:flex-1">
        <Search className="size-5 text-[#d6c3b5]" />
        <input
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            activateSearch();
          }}
          onFocus={activateSearch}
          placeholder="Search files, actions, or data..."
          className="w-full bg-transparent text-[15px] text-text-primary outline-none placeholder:text-outline-variant"
        />
      </div>

      <nav className="hidden items-center gap-6 text-[14px] font-semibold text-[#d6c3b5] xl:flex">
        {["Workspace", "Tools", "API", "Docs"].map((item, index) => (
          <button
            key={item}
            type="button"
            className={cn(
              "border-b-2 pb-1 transition-colors",
              index === 0
                ? "border-[#c07040] text-[#d69463]"
                : "border-transparent hover:text-text-primary",
            )}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4 lg:w-full lg:max-w-max">
        <button className="hidden rounded-sm border border-[#333] px-4 py-2 text-sm font-semibold text-[#d6c3b5] sm:inline-flex">
          Share
        </button>
        <button className="rounded-sm bg-[#c77742] px-4 py-2 text-sm font-semibold text-black sm:px-6">
          Deploy
        </button>
        <div className="h-5 w-px bg-[#2c2c2c]" />
        <Bell className="size-5 text-[#d6c3b5]" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2c2c2c] bg-[#101010] text-xs font-bold text-[#d69463]">
          JL
        </div>
      </div>
    </header>
  );
}
