"use client";

import React from "react";

import { cn } from "@/lib/utils";

export function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 rounded-sm border-[0.5px] border-ui-border bg-[#111111] px-3 py-2 text-sm font-medium text-[#f5f1ea] transition-colors hover:border-[#2A2F42] focus-visible:border-[#C07040] focus-visible:outline-none sm:px-4"
    >
      {icon}
      {label}
    </button>
  );
}

export function IconButton({
  active,
  icon,
  onClick,
  title,
}: {
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-sm p-2 transition-colors",
        active
          ? "bg-[#1f1f1f] text-[#d69463]"
          : "text-[#d6c3b5] hover:bg-[#1a1a1a] hover:text-[#f5f1ea]",
      )}
    >
      {icon}
    </button>
  );
}

export function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b-[0.5px] border-ui-border p-5">
      <h3 className="mb-4 text-[11px] font-medium tracking-[0.5px] text-[#5A6070]">{title}</h3>
      {children}
    </div>
  );
}

export function SidebarEmpty({ text }: { text: string }) {
  return <p className="text-[13px] font-normal leading-[1.6] text-[#8B92A8]">{text}</p>;
}

export function SmallAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border-[0.5px] border-ui-border bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-[#d6c3b5] transition-colors hover:border-[#2A2F42] focus-visible:border-[#C07040] focus-visible:outline-none"
    >
      {label}
    </button>
  );
}

export function IssueCard({
  tone,
  icon,
  title,
  body,
}: {
  tone: "success" | "warning" | "error";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const toneClasses =
    tone === "error"
      ? "border-ui-border bg-[#4a0c0c] text-[#f1b0b0]"
      : tone === "warning"
      ? "border-ui-border bg-[#14110b] text-[#d7c49d]"
      : "border-ui-border bg-[#0d1510] text-[#8ed08e]";

  return (
    <div className={cn("rounded-sm border-[0.5px] px-4 py-4", toneClasses)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="text-[14px] font-medium text-[#E8EAF0]">{title}</p>
          <p className="mt-1 text-[13px] font-normal leading-[1.6] text-current/85">{body}</p>
        </div>
      </div>
    </div>
  );
}
