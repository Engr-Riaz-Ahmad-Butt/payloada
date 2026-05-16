"use client";

import { Diff, FileCode2, KeyRound } from "lucide-react";

const features = [
  {
    icon: FileCode2,
    title: "Precision editor",
    description: "Flawless syntax highlighting with 8pt grid precision.",
    label: "Editor workflow",
  },
  {
    icon: KeyRound,
    title: "Fast JWT decoder",
    description: "Decode and verify JWT tokens without leaving your workspace.",
    label: "Token workflow",
  },
  {
    icon: Diff,
    title: "Intelligent diff",
    description: "Compare JSON payloads side-by-side with smart conflict detection.",
    label: "Review workflow",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="w-full max-w-300 px-4 py-12 sm:px-6 md:px-8 md:py-14">
      <div className="mb-8 flex flex-col gap-3 md:mb-10">
        <p
          className="text-xs font-semibold tracking-[0.02em]"
          style={{ color: "#d9c2b6", fontFamily: "Inter, sans-serif" }}
        >
          Core Features
        </p>
        <h2
          style={{
            color: "#F5F1EA",
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            lineHeight: "1.08",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Built for the JSON work people actually do every day.
        </h2>
        <p
          className="max-w-3xl"
          style={{
            color: "#d9c2b6",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            lineHeight: "26px",
          }}
        >
          jsonLines is more than a beautifier. It brings formatting, decoding, diffing, searching,
          generation, and safety checks into one focused workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description, label }) => (
          <div
            key={title}
            className="group relative flex h-full flex-col overflow-hidden rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-6 transition-[border-color,transform,background-color] duration-150 hover:-translate-y-0.5 hover:border-[#C07040]"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-150"
              style={{
                background:
                  "linear-gradient(180deg, rgba(192,112,64,0.05) 0%, rgba(18,18,18,0) 30%), linear-gradient(135deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0) 55%)",
              }}
            />
            <div className="relative mb-1 flex items-center justify-between">
              <span
                style={{
                  color: "#5A6070",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </span>
              <span
                className="h-[0.5px] w-10 transition-all duration-150 group-hover:w-14"
                style={{ backgroundColor: "#2A2F42" }}
              />
            </div>

            <div
              className="relative mt-3 flex h-11 w-11 items-center justify-center rounded-[10px] border-[0.5px] transition-colors"
              style={{
                backgroundColor: "#1F140C",
                borderColor: "#1E2433",
                color: "#C07040",
              }}
            >
              <Icon className="h-[22px] w-[22px]" />
            </div>

            <h3
              className="relative mt-4"
              style={{
                color: "#F5F1EA",
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                lineHeight: "1.4",
                fontWeight: 600,
              }}
            >
              {title}
            </h3>

            <p
              className="relative mt-3 max-w-[26ch]"
              style={{
                color: "#8B92A8",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                lineHeight: "1.5",
                fontWeight: 400,
              }}
            >
              {description}
            </p>

            <div
              className="relative mt-5 h-[0.5px] w-full transition-colors duration-150 group-hover:bg-[#C07040]"
              style={{ backgroundColor: "#2A2F42" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
