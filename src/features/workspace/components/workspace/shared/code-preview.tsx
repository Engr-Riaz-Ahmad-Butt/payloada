"use client";

import { cn } from "@/lib/utils";

export function CodePreview({ value, className }: { value: string; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-auto rounded-sm border-[0.5px] border-ui-border bg-obsidian-base p-4 font-mono text-xs leading-6 text-text-primary",
        className,
      )}
    >
      {value}
    </pre>
  );
}
