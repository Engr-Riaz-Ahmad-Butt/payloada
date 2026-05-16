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
  accent: "header" | "payload" | "signature" | "claims";
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const accentColor =
    accent === "header"
      ? "#79C0FF"
      : accent === "payload"
      ? "#C07040"
      : accent === "signature"
      ? "#F5A623"
      : "#E8EAF0";

  return (
    <div className="group overflow-hidden rounded-lg border-[0.5px] border-ui-border bg-[#121212]">
      <div className="flex items-center justify-between border-b-[0.5px] border-ui-border bg-[#0e0e0e] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-5 w-[2px] rounded-full" style={{ backgroundColor: accentColor }} />
          <span
            className={cn("text-[12px] font-semibold tracking-[0.01em]")}
            style={{ color: accentColor }}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-normal leading-[1.6] text-[#8B92A8]">{subtitle}</span>
          {actions}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
