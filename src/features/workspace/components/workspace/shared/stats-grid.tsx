"use client";

import type { JsonStats } from "@/types/json";
import { cn } from "@/lib/utils";

import { formatBytes } from "./utils";

export function StatsGrid({ stats }: { stats: JsonStats }) {
  const items: Array<{ label: string; value: string; tone: "default" | "gold" }> = [
    { label: "Size", value: formatBytes(stats.bytes), tone: "gold" },
    { label: "Max Depth", value: String(stats.maxDepth), tone: "gold" },
    { label: "Objects", value: String(stats.objects), tone: "default" },
    { label: "Arrays", value: String(stats.arrays), tone: "default" },
    { label: "Keys", value: String(stats.keys), tone: "default" },
    { label: "Strings", value: String(stats.strings), tone: "default" },
    { label: "Numbers", value: String(stats.numbers), tone: "default" },
    { label: "Booleans", value: String(stats.booleans), tone: "default" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <StatTile key={item.label} label={item.label} value={item.value} tone={item.tone} />
      ))}
    </div>
  );
}

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold";
}) {
  return (
    <div className="rounded-sm border border-[#262626] bg-[#0a0a0a] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#6d655f]">{label}</p>
      <p
        className={cn(
          "mt-2 font-mono text-[24px] leading-none",
          tone === "gold" ? "text-[#d4b483]" : "text-[#f5f1ea]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
