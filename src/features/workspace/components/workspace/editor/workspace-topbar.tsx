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
    <header className="flex h-16 items-center justify-between border-b border-[#262626] bg-[#080808] px-5 sm:px-6 lg:px-10">
      <div className="flex min-w-[320px] items-center gap-4">
        <Search className="size-5 text-[#d6c3b5]" />
        <input
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            activateSearch();
          }}
          onFocus={activateSearch}
          placeholder="Search files, actions, or data..."
          className="w-full bg-transparent text-[15px] text-[#f5f1ea] outline-none placeholder:text-[#5b5450]"
        />
      </div>

      <nav className="hidden items-center gap-10 text-[15px] font-semibold text-[#d6c3b5] lg:flex">
        {["Workspace", "Tools", "API", "Docs"].map((item, index) => (
          <button
            key={item}
            type="button"
            className={cn(
              "border-b-2 pb-1 transition-colors",
              index === 0
                ? "border-[#c07040] text-[#d69463]"
                : "border-transparent hover:text-[#f5f1ea]",
            )}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        <button className="rounded-sm border border-[#333] px-4 py-2 text-sm font-semibold text-[#d6c3b5]">
          Share
        </button>
        <button className="rounded-sm bg-[#c77742] px-6 py-2 text-sm font-semibold text-black">
          Deploy
        </button>
        <div className="hidden h-5 w-px bg-[#2c2c2c] lg:block" />
        <Bell className="hidden size-5 text-[#d6c3b5] lg:block" />
        <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#2c2c2c] bg-[#101010] text-xs font-bold text-[#d69463] lg:flex">
          JL
        </div>
      </div>
    </header>
  );
}
