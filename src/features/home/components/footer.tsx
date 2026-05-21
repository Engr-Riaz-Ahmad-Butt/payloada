import Link from "next/link";

const footerGroups = [
  {
    title: "Tools",
    links: [
      { label: "JSON Formatter", href: "/json-formatter" },
      { label: "JSON Validator", href: "/json-validator" },
      { label: "JWT Decoder", href: "/jwt-decoder" },
      { label: "JSON Diff", href: "/json-diff" },
      { label: "Graph Visualizer", href: "/json-graph-visualizer" },
    ],
  },
  {
    title: "Converters",
    links: [
      { label: "JSON to TypeScript", href: "/json-to-typescript" },
      { label: "JSON to Zod", href: "/zod-schema-generator" },
      { label: "JSON to CSV", href: "/json-to-csv" },
      { label: "JSON Schema", href: "/json-schema-generator" },
      { label: "Mock JSON Generator", href: "/mock-json-generator" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Workspace", href: "/workspace" },
      { label: "JSON Formatter", href: "/json-formatter" },
      { label: "JSON Validator", href: "/json-validator" },
      { label: "JWT Decoder", href: "/jwt-decoder" },
      { label: "JSON Diff", href: "/json-diff" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t-[0.5px] border-ui-border bg-obsidian-base">
      <div className="mx-auto grid w-full max-w-300 gap-10 px-4 py-10 sm:px-6 md:px-8 md:py-12 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div>
            <h2
              style={{
                color: "#C07040",
                fontFamily: "Inter, sans-serif",
                fontSize: "28px",
                lineHeight: "30px",
                fontWeight: 800,
              }}
            >
              Payloada
            </h2>
            <p
              className="mt-4"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                lineHeight: "26px",
              }}
            >
              The modern JSON workspace for developers.
            </p>
            <p
              className="mt-2"
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                lineHeight: "24px",
              }}
            >
              Your JSON stays in your browser unless you choose to share it.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Local-only processing",
              "No signup required",
              "Privacy-first",
              "Built for developers",
            ].map((badge) => (
              <span
                key={badge}
                className="rounded-[10px] border-[0.5px] border-ui-border bg-surface-elevated px-3 py-1.5"
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3
                className="mb-4 text-[11px] font-medium tracking-[0.04em]"
                style={{ color: "var(--color-text-secondary)", fontFamily: "Inter, sans-serif" }}
              >
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block transition-colors hover:text-text-primary"
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t-[0.5px] border-ui-border">
        <div
          className="mx-auto flex w-full max-w-300 flex-col gap-3 px-4 py-4 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 md:text-left"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", lineHeight: "18px" }}
        >
          <span style={{ color: "var(--color-text-secondary)" }}>© 2026 Payloada. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4" style={{ color: "var(--color-text-secondary)" }}>
            <span>Local-only processing</span>
            <span>No signup required</span>
            <span>Built for developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
