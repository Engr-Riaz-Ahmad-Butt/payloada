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

export function EditorControlButton({
  icon,
  label,
  onClick,
  active = false,
  priority = "default",
}: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  priority?: "default" | "primary" | "accent";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-[6px] border-[0.5px] px-3.5 text-[12px] font-semibold transition-all focus-visible:border-copper-accent focus-visible:outline-none active:scale-[0.98]",
        priority === "primary"
          ? "border-copper-accent bg-copper-accent text-white hover:opacity-90 shadow-[0_0_12px_rgba(192,112,64,0.2)]"
          : priority === "accent" || active
            ? "border-copper-accent/35 bg-copper-accent/10 text-copper-accent hover:border-copper-accent/60"
            : "border-ui-border bg-surface-elevated/40 text-text-secondary hover:border-ui-border-hover hover:text-text-primary",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function EditorFileTab({
  label,
  active = true,
  onClose,
}: {
  label: string;
  active?: boolean;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-12 items-center gap-3 border-b-2 px-5",
        active ? "border-copper-accent bg-surface text-text-primary" : "border-transparent text-text-secondary",
      )}
    >
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-full",
          active ? "bg-emerald-400" : "bg-ui-border",
        )}
      />
      <span className="text-[14px] font-semibold">{label}</span>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="text-text-secondary transition-colors hover:text-text-primary focus-visible:text-text-primary focus-visible:outline-none"
        >
          ×
        </button>
      ) : null}
    </div>
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

export function SidebarSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b-[0.5px] border-ui-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary/80">
          {title}
        </h3>
        {action ? <div className="flex items-center gap-1.5">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function SidebarEmpty({ text }: { text: string }) {
  return <p className="text-[13px] font-normal leading-[1.6] text-text-secondary">{text}</p>;
}

export function ToggleButton({
  label,
  active,
  onClick,
  size = "md",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-[0.5px] px-3 transition-colors focus-visible:outline-none",
        size === "sm" ? "h-7 rounded-md text-[11px] font-medium" : "h-9 rounded-sm text-xs font-semibold",
        active
          ? "border-copper-accent bg-copper-accent/10 text-copper-accent"
          : "border-ui-border bg-surface-elevated text-text-secondary hover:border-ui-border-hover hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}

export function SquareIconButton({
  icon,
  onClick,
  title,
  active = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-[10px] border-[0.5px] border-ui-border bg-surface transition-colors hover:border-ui-border-hover hover:text-text-primary",
        active && "text-copper-accent",
      )}
    >
      {icon}
    </button>
  );
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
      ? "border-red-500/20 dark:border-red-900/20 bg-[#2A0D10]/35 border-l-4 border-l-red-500 text-red-400"
      : tone === "warning"
      ? "border-amber-500/20 dark:border-amber-900/20 bg-amber-950/15 border-l-4 border-l-[#F5A623] text-[#F5A623]"
      : "border-emerald-500/20 dark:border-emerald-900/20 bg-emerald-950/15 border-l-4 border-l-[#3DD68C] text-[#3DD68C]";

  const actionTextClass =
    tone === "error"
      ? "text-red-400 hover:text-red-300"
      : tone === "warning"
      ? "text-[#F5A623] hover:text-amber-300"
      : "text-[#3DD68C] hover:text-emerald-300";

  return (
    <div className={cn("rounded-xl border-[0.5px] px-4 py-4 text-left transition-colors", toneClasses)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-text-primary leading-tight">{title}</p>
          <p className="mt-1.5 font-mono text-[11px] leading-normal text-text-secondary truncate">{body}</p>
          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className={cn("mt-2 flex items-center gap-1.5 text-[11.5px] font-bold no-underline transition-all hover:opacity-100 active:scale-95", actionTextClass)}
            >
              <span>→</span>
              <span>{action.label}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
