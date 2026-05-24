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
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary/80">{title}</h3>
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
  action,
}: {
  tone: "success" | "warning" | "error";
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  const toneClasses =
    tone === "error"
      ? "border-red-500/20 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
      : tone === "warning"
      ? "border-amber-500/20 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
      : "border-emerald-500/20 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400";

  return (
    <div className={cn("rounded-sm border-[0.5px] px-4 py-4", toneClasses)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-text-primary">{title}</p>
          <p className="mt-1 text-[13px] font-normal leading-[1.6] text-text-secondary">{body}</p>
          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className="mt-2 text-[11px] font-semibold underline underline-offset-2 opacity-80 transition-opacity hover:opacity-100"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
