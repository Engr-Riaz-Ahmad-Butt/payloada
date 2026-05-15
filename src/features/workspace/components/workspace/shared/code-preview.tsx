"use client";

import { cn } from "@/lib/utils";

export function CodePreview({ value, className }: { value: string; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-auto rounded-sm border border-[#262626] bg-[#0a0a0a] p-4 font-mono text-xs leading-6 text-[#f5f1ea]",
        className,
      )}
    >
      {value}
    </pre>
  );
}
