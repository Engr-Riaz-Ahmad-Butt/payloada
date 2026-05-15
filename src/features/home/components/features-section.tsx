"use client";

import { Braces, Diff, FileCode2, KeyRound, Search, ShieldAlert } from "lucide-react";

const features = [
  {
    icon: Braces,
    title: "JSON Formatter",
    description:
      "Beautify and minify payloads instantly with readable structure and fast copy/export actions.",
    example: "Clean webhook bodies before debugging or sharing them with your team.",
  },
  {
    icon: KeyRound,
    title: "JWT Decoder",
    description:
      "Decode header and payload claims quickly, then verify signatures in the same workspace.",
    example: "Inspect auth tokens without bouncing to another tool.",
  },
  {
    icon: Diff,
    title: "JSON Diff",
    description:
      "Compare original and modified payloads side by side with readable summaries of what changed.",
    example: "Spot added fields, removed keys, and type mismatches fast.",
  },
  {
    icon: FileCode2,
    title: "JSON to TypeScript",
    description:
      "Generate developer-ready interfaces and output from real API responses inside the app.",
    example: "Turn nested payloads into usable types without hand-writing interfaces.",
  },
  {
    icon: Search,
    title: "JSONPath Finder",
    description:
      "Explore deep structures and copy exact paths for frontend mapping, tests, and debugging.",
    example: "Jump straight to `$.users[0].profile.email` in seconds.",
  },
  {
    icon: ShieldAlert,
    title: "Sensitive Data Scanner",
    description:
      "Catch tokens, secrets, and private-looking fields before you export or share a payload.",
    example: "Detect `password`, `secret`, and email-style fields automatically.",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="w-full max-w-[1200px] px-4 py-14 md:px-8">
      <div className="mb-8 flex flex-col gap-3 md:mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-[0.14em]"
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
          Built for the JSON work developers actually do every day.
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
          generation, and safety checks into one terminal-inspired workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map(({ icon: Icon, title, description, example }) => (
          <div
            key={title}
            className="group rounded border p-6 transition-colors"
            style={{
              backgroundColor: "#121212",
              borderColor: "#262626",
              borderRadius: "0.25rem",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = "#C07040";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = "#262626";
            }}
          >
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded border"
              style={{
                borderColor: "#2d2119",
                backgroundColor: "#0c0c0c",
                color: "#C07040",
              }}
            >
              <Icon className="h-5 w-5" />
            </div>

            <h3
              className="mb-2"
              style={{
                color: "#F5F1EA",
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                lineHeight: "24px",
                fontWeight: 600,
              }}
            >
              {title}
            </h3>

            <p
              style={{
                color: "#d9c2b6",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
              }}
            >
              {description}
            </p>

            <div
              className="mt-5 border-t pt-4"
              style={{
                borderColor: "#262626",
                color: "#b8a69a",
                fontSize: "12px",
                lineHeight: "20px",
              }}
            >
              {example}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
