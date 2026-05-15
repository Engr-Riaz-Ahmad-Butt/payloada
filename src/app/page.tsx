import Link from "next/link";
import { Code2 } from "lucide-react";

import FeaturesSection from "@/features/home/components/features-section";
import FaqSection from "@/features/home/components/faq-section";
import Footer from "@/features/home/components/footer";
import Navbar from "@/features/home/components/navbar";
import WorkspaceMockup from "@/features/home/components/workspace-mockup";

const useCases = [
  ["Frontend developers", "Inspect API payloads, generate TypeScript, and map nested data faster."],
  ["Backend developers", "Validate contracts, compare responses, and explore large JSON bodies."],
  ["QA testers", "Check expected vs actual payloads, search paths, and isolate regressions."],
  [
    "Students",
    "Learn JSON structure, fix syntax mistakes, and understand nested objects visually.",
  ],
  ["DevOps engineers", "Review deployment configs and environment payloads safely in one place."],
] as const;

const faqs = [
  [
    "Is jsonLines free to use?",
    "Yes. The core formatting, diffing, decoding, and inspection workflow is available without signup.",
  ],
  [
    "Is my JSON uploaded?",
    "The main workspace is privacy-first and local-only by default, which is especially useful for sensitive payloads.",
  ],
  [
    "Can I decode JWTs and compare JSON in one product?",
    "Yes. jsonLines combines formatter, JWT decoder, diff workspace, converters, and validation in one flow.",
  ],
  [
    "Can I generate TypeScript from JSON?",
    "Yes. TypeScript, Zod, Schema, and other output generators are part of the product workflow.",
  ],
] as const;

const comparisons = [
  ["Formatter only", "jsonLines workspace"],
  ["One action per page", "Multiple developer workflows together"],
  ["Little privacy messaging", "Local-first and privacy-forward"],
  ["Raw output only", "Readable summaries and guided inspection"],
] as const;

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#080808", color: "#F5F1EA", fontFamily: "Inter, sans-serif" }}
    >
      <Navbar />

      <main className="flex flex-1 flex-col items-center">
        <section className="mt-8 flex w-full max-w-300 flex-col items-center px-4 py-16 text-center md:px-8 md:py-12">
          <h1
            className="mb-6 max-w-3xl leading-tight"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(28px, 5vw, 48px)",
              lineHeight: "1.15",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#F5F1EA",
            }}
          >
            The JSON workspace for <span style={{ color: "#C07040" }}>serious developers.</span>
          </h1>

          <p
            className="mb-8 max-w-2xl"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              lineHeight: "24px",
              color: "#d9c2b6",
            }}
          >
            Experience unparalleled speed and precision in a terminal-inspired environment.
            jsonLines provides the tools you need to build, decode, and diff with absolute control.
          </p>

          <div className="mb-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/workspace"
              className="flex items-center justify-center gap-2 px-6 py-3 transition-all hover:brightness-110 active:scale-95"
              style={{
                backgroundColor: "#C07040",
                color: "#F5F1EA",
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderRadius: "0.125rem",
                textDecoration: "none",
              }}
            >
              Get Started — It&apos;s Free
            </Link>
            <button
              className="flex items-center justify-center gap-2 border px-6 py-3 transition-colors hover:bg-surface-elevated active:scale-95"
              style={{
                borderColor: "#262626",
                color: "#F5F1EA",
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderRadius: "0.125rem",
              }}
            >
              <Code2 className="size-4" />
              View on GitHub
            </button>
          </div>

          <WorkspaceMockup />
        </section>

        <FeaturesSection />

        <section className="w-full max-w-300 px-4 py-14 md:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_380px]">
            <div
              className="rounded border p-8"
              style={{ borderColor: "#262626", backgroundColor: "#121212" }}
            >
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#d9c2b6" }}
              >
                Privacy-first
              </p>
              <h2
                style={{
                  fontSize: "32px",
                  lineHeight: "38px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Your JSON stays in your browser.
              </h2>
              <p
                className="mt-4"
                style={{ color: "#d9c2b6", fontSize: "15px", lineHeight: "28px" }}
              >
                jsonLines is designed for payloads that developers actually care about. Formatting,
                validation, tree exploration, JWT decoding, diffing, and generation all happen in a
                privacy-first workspace without forcing you through signup first.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "Local-only processing for core formatting and analysis",
                "Sensitive data scanner for tokens, emails, and secret-like fields",
                "Clear outputs, readable structure, and faster debugging flow",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded border p-5"
                  style={{ borderColor: "#262626", backgroundColor: "#121212" }}
                >
                  <p style={{ color: "#F5F1EA", fontSize: "14px", lineHeight: "24px" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full max-w-300 px-4 py-14 md:px-8">
          <div className="mb-8">
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: "#d9c2b6" }}
            >
              Use Cases
            </p>
            <h2
              style={{
                fontSize: "32px",
                lineHeight: "38px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Built for real developer workflows.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map(([title, description]) => (
              <div
                key={title}
                className="rounded border p-6"
                style={{ borderColor: "#262626", backgroundColor: "#121212" }}
              >
                <h3
                  style={{
                    color: "#F5F1EA",
                    fontSize: "18px",
                    lineHeight: "24px",
                    fontWeight: 600,
                  }}
                >
                  {title}
                </h3>
                <p
                  className="mt-3"
                  style={{ color: "#d9c2b6", fontSize: "14px", lineHeight: "24px" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-300 px-4 py-14 md:px-8">
          <div className="grid gap-6 xl:grid-cols-2">
            <div
              className="rounded border p-8"
              style={{ borderColor: "#262626", backgroundColor: "#121212" }}
            >
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#d9c2b6" }}
              >
                Comparison
              </p>
              <h2
                style={{
                  fontSize: "32px",
                  lineHeight: "38px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                More than a formatter tab in a random tools site.
              </h2>

              <div className="mt-6 space-y-3">
                {comparisons.map(([left, right]) => (
                  <div
                    key={left}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded border px-4 py-3"
                    style={{ borderColor: "#262626", backgroundColor: "#0d0d0d" }}
                  >
                    <span style={{ color: "#b8a69a", fontSize: "13px" }}>{left}</span>
                    <span style={{ color: "#C07040", fontSize: "13px", fontWeight: 700 }}>→</span>
                    <span style={{ color: "#F5F1EA", fontSize: "13px" }}>{right}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded border p-8"
              style={{ borderColor: "#262626", backgroundColor: "#121212" }}
            >
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: "#d9c2b6" }}
              >
                SEO Content
              </p>
              <h2
                style={{
                  fontSize: "32px",
                  lineHeight: "38px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                A homepage that explains the product and helps discovery.
              </h2>
              <p
                className="mt-4"
                style={{ color: "#d9c2b6", fontSize: "15px", lineHeight: "28px" }}
              >
                jsonLines combines JSON formatting, JWT decoding, JSON diffing, type generation,
                search, and safety checks in one modern workspace. That makes it useful for users
                and clearer for search engines too.
              </p>
              <p
                className="mt-4"
                style={{ color: "#d9c2b6", fontSize: "15px", lineHeight: "28px" }}
              >
                Instead of looking like a thin marketing wrapper, the homepage should show the
                actual product, explain why it matters, and surface the workflows developers want to
                use most.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-300 px-4 py-14 md:px-8">
          <div className="mb-8">
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: "#d9c2b6" }}
            >
              FAQ
            </p>
            <h2
              style={{
                fontSize: "32px",
                lineHeight: "38px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Questions users ask before they trust a JSON tool.
            </h2>
          </div>

          <FaqSection items={faqs.map(([question, answer]) => ({ question, answer }))} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
