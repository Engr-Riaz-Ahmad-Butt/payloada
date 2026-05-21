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
      className="inline-flex min-h-10 items-center gap-2 rounded-sm border-[0.5px] border-ui-border bg-surface-elevated px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-ui-border-hover focus-visible:border-copper-accent focus-visible:outline-none sm:px-4"
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
          ? "bg-surface-container-low text-copper-accent"
          : "text-on-surface-variant hover:bg-surface-container-low hover:text-text-primary",
      )}
    >
      {icon}
    </button>
  );
}

export function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b-[0.5px] border-ui-border p-5">
      <h3 className="mb-4 text-[11px] font-medium tracking-[0.5px] text-outline-variant">{title}</h3>
      {children}
    </div>
  );
}

export function SidebarEmpty({ text }: { text: string }) {
  return <p className="text-[13px] font-normal leading-[1.6] text-text-secondary">{text}</p>;
}

export function SmallAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border-[0.5px] border-ui-border bg-obsidian-base px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:border-ui-border-hover hover:text-text-primary focus-visible:border-copper-accent focus-visible:outline-none"
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
      ? "border-[#4A1520] bg-[#2A0D10] text-[#FFB3BD]"
      : tone === "warning"
      ? "border-[#4A3000] bg-[#2A1A00] text-[#F4D39A]"
      : "border-[#1D4D35] bg-[#0D2E23] text-[#A8E8BF]";

  return (
    <div className={cn("rounded-sm border-[0.5px] px-4 py-4", toneClasses)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="text-[14px] font-medium text-text-primary">{title}</p>
          <p className="mt-1 text-[13px] font-normal leading-[1.6] text-current/85">{body}</p>
        </div>
      </div>
    </div>
  );
}
