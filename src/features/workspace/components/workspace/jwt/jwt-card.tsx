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
    <div className="group overflow-hidden rounded-lg border-[0.5px] border-ui-border bg-[#121212]">
      <div className="flex items-center justify-between border-b-[0.5px] border-ui-border bg-[#0e0e0e] px-4 py-3">
        <div>
          <span className={cn("text-[11px] font-medium tracking-[0.5px]", headingClass)}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-normal leading-[1.6] text-[#8B92A8]">{subtitle}</span>
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
