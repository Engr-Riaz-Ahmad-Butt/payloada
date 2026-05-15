"use client";

import React from "react";

import { cn } from "@/lib/utils";

export function JwtCard({
  title,
  subtitle,
  accent,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  accent: "copper" | "secondary" | "primary";
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const accentClasses =
    accent === "copper"
      ? "bg-[#c07040]/20 group-hover:bg-[#c07040] text-[#c07040]"
      : accent === "secondary"
      ? "bg-[#e3c290]/20 group-hover:bg-[#e3c290] text-[#e3c290]"
      : "bg-[#ffb68e]/20 group-hover:bg-[#ffb68e] text-[#ffb68e]";

  const headingClass =
    accent === "copper"
      ? "text-[#c07040]"
      : accent === "secondary"
      ? "text-[#e3c290]"
      : "text-[#ffb68e]";

  return (
    <div className="group overflow-hidden rounded-lg border border-[#262626] bg-[#121212]">
      <div className="flex items-center justify-between border-b border-[#262626] bg-[#0e0e0e] px-4 py-3">
        <div>
          <span
            className={cn("text-[12px] font-semibold uppercase tracking-[0.1em]", headingClass)}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#a89589]">{subtitle}</span>
          {actions}
        </div>
      </div>
      <div className="relative p-4">
        <div className={cn("absolute inset-y-0 left-0 w-1 transition-colors", accentClasses)} />
        <div className="pl-2">{children}</div>
      </div>
    </div>
  );
}
