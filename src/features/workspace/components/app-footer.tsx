import Link from "next/link";

import { APP_NAME } from "@/constants";

const footerGroups = [
  {
    title: "Tools",
    links: [
      { label: "JSON Formatter", href: "/json-formatter" },
      { label: "JSON Validator", href: "/json-validator" },
      { label: "JSON Tree Viewer", href: "/json-tree-viewer" },
      { label: "JSON Diff", href: "/json-diff" },
      { label: "JWT Decoder", href: "/jwt-decoder" },
    ],
  },
  {
    title: "Converters",
    links: [
      { label: "JSON to TypeScript", href: "/json-to-typescript" },
      { label: "JSON to Zod", href: "/json-to-zod" },
      { label: "JSON to CSV", href: "/json-to-csv" },
      { label: "JSON to YAML", href: "/json-to-yaml" },
      { label: "JSON to XML", href: "/json-to-xml" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "What is JSON?", href: "/what-is-json" },
      { label: "JSONPath Guide", href: "/jsonpath-guide" },
      { label: "JSON Schema Guide", href: "/json-schema-guide" },
      { label: "Common JSON Errors", href: "/common-json-errors" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
      { label: "GitHub", href: "https://github.com", external: true },
    ],
  },
] as const;

const trustBadges = [
  "Local-only processing",
  "No signup required",
  "No data stored",
  "Fast browser-based tools",
] as const;

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-white py-10 dark:bg-[#020617]">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
        <div className="space-y-5">
          <div className="space-y-3">
            <h2 className="text-[28px] leading-none font-semibold tracking-tight">{APP_NAME}</h2>
            <p className="max-w-sm text-[15px] leading-6 text-[var(--text-secondary)]">
              A modern JSON workspace for developers.
            </p>
            <p className="max-w-sm text-[15px] leading-6 text-muted-foreground">
              Your JSON stays in your browser.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-[var(--radius)] border border-border bg-secondary px-3 py-1.5 text-[13px] font-medium text-muted-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              <div className="space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="block text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-5">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>Local-only processing</span>
            <span>No signup required</span>
            <span>Built for developers</span>
          </div>
          <p>
            {"© 2026 "}
            {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
