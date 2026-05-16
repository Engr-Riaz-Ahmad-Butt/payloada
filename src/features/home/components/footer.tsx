import Link from "next/link";

const footerGroups = [
  {
    title: "Tools",
    links: ["JSON Formatter", "JWT Decoder", "JSON Diff", "JSONPath Finder", "Sensitive Scanner"],
  },
  {
    title: "Converters",
    links: ["JSON to TypeScript", "JSON to Zod", "JSON to CSV", "JSON to YAML", "JSON to XML"],
  },
  {
    title: "Resources",
    links: ["What is JSON?", "Common JSON Errors", "JWT Guide", "JSONPath Guide", "Questions"],
  },
  {
    title: "Company",
    links: ["Privacy", "Terms", "Contact", "GitHub", "Changelog"],
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
              jsonLines
            </h2>
            <p
              className="mt-4"
              style={{
                color: "#F5F1EA",
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
                color: "#8B92A8",
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
                  color: "#d9c2b6",
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
                style={{ color: "#5A6070", fontFamily: "Inter, sans-serif" }}
              >
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    className="block transition-colors hover:text-[#F5F1EA]"
                    style={{
                      color: "#d9c2b6",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                    }}
                  >
                    {link}
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
          <span style={{ color: "#d9c2b6" }}>© 2026 jsonLines. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4" style={{ color: "#d9c2b6" }}>
            <span>Local-only processing</span>
            <span>No signup required</span>
            <span>Built for developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
