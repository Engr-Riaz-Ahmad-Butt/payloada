import { Fragment } from "react";
import Link from "next/link";

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
    "Is Payloada free to use?",
    "Yes. The core formatting, diffing, decoding, and inspection workflow is available without signup.",
  ],
  [
    "Is my JSON uploaded?",
    "The main workspace is privacy-first and local-only by default, which is especially useful for sensitive payloads.",
  ],
  [
    "Can I decode JWTs and compare JSON in one product?",
    "Yes. Payloada combines formatter, JWT decoder, diff workspace, converters, and validation in one flow.",
  ],
  [
    "Can I generate TypeScript from JSON?",
    "Yes. TypeScript, Zod, Schema, and other output generators are part of the product workflow.",
  ],
  [
    "Does the AI assistant send my JSON to a server?",
    "Yes - the AI tab sends your JSON to a secure API for processing. Core tools like formatting, diff, JWT decoding, and converters stay in your browser.",
  ],
] as const;



export default function Home() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Payloada",
      "url": "https://payloada.dev",
      "description":
        "Format JSON, decode JWTs, compare payloads, and generate developer-ready outputs in a fast, privacy-first workspace.",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(([question, answer]) => ({
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answer,
        },
      })),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-obsidian-base font-sans text-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <Navbar />
      <main className="flex flex-1 flex-col items-center overflow-x-hidden">
        <section className="relative mt-4 flex w-full max-w-300 flex-col items-center px-4 py-12 text-center sm:mt-6 sm:px-6 sm:py-14 md:mt-8 md:px-8 md:py-20 overflow-visible">
          {/* Refined Developer Grid & Glow Backdrop */}
          <div 
            className="absolute inset-0 -z-10 opacity-[0.8] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(192, 112, 64, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(192, 112, 64, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: "4.5rem 4.5rem",
              maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 65%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 65%, transparent 100%)",
            }}
          />
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[300px] w-[500px] max-w-full rounded-full opacity-30 blur-[100px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(192, 112, 64, 0.25) 0%, transparent 70%)"
            }}
          />

          <div className="relative mb-5 max-w-[760px] sm:mb-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 scale-[1.02] blur-[18px] opacity-45"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "clamp(36px, 7vw, 64px)",
                lineHeight: "1.05",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "rgba(232, 234, 240, 0.28)",
                textShadow: "0 0 36px rgba(232, 234, 240, 0.18), 0 0 70px rgba(192, 112, 64, 0.14)",
              }}
            >
              The modern JSON workspace for serious developers.
            </div>

            <h1
              className="relative leading-tight"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "clamp(36px, 7vw, 64px)",
                lineHeight: "1.05",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--color-on-surface)",
                textShadow: "0 0 18px rgba(255, 255, 255, 0.04)",
              }}
            >
              The modern JSON workspace for{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #C97A3D 0%, #E89A3D 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 900,
                  filter: "drop-shadow(0 0 18px rgba(192, 112, 64, 0.28))",
                }}
              >
                serious
              </span>{" "}
              developers.
            </h1>
          </div>

          <p
            className="mb-8 max-w-[560px] px-1 sm:px-0"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(16px, 2.2vw, 18px)",
              lineHeight: "1.65",
              fontWeight: 400,
              color: "var(--color-text-secondary)",
            }}
          >
            Format JSON, decode JWTs, compare payloads, and generate developer-ready outputs in a
            fast, privacy-first workspace.
          </p>

          {/* Primary CTA */}
          <div className="mb-8 flex w-full justify-center">
            <Link
              href="/workspace"
              className="flex h-12 min-w-[240px] items-center justify-center gap-2 rounded-[8px] bg-[#C07040] px-7 text-center transition-all hover:bg-[#D48050] active:scale-95 hover:shadow-[0_0_24px_rgba(192,112,64,0.35)]"
              style={{
                color: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Get started for free
            </Link>
          </div>

          {/* Premium Pill Trust Badges */}
          <div className="mb-14 flex flex-wrap items-center justify-center gap-3 sm:mb-16">
            {["No signup required", "Local-only processing", "Built for developers"].map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 rounded-full border-[0.5px] border-ui-border/70 bg-surface-elevated/40 px-3.5 py-1.5 backdrop-blur-sm transition-colors hover:border-ui-border-hover"
                style={{ 
                  color: "var(--color-text-secondary)", 
                  fontFamily: "Inter, sans-serif", 
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#3DD68C] shadow-[0_0_8px_#3DD68C]" />
                {item}
              </span>
            ))}
          </div>

          {/* Backlit Dimensional Mockup */}
          <div className="relative w-full flex justify-center overflow-visible">
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[380px] w-[80%] rounded-full opacity-40 blur-[100px] pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(192,112,64,0.18) 0%, transparent 70%)"
              }}
            />
            <WorkspaceMockup />
          </div>
        </section>

        {/* Visual Workflow Strip */}
        <section className="w-full max-w-300 px-4 py-8 sm:px-6 md:px-8">
          <div className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-6 md:p-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.08em] text-[#C07040] mb-6">
              From raw payload to usable output
            </p>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-4">
              {[
                { title: "Format", desc: "Clean & unminify" },
                { title: "Validate", desc: "Scan syntax & safety" },
                { title: "Diff", desc: "Spot schema conflicts" },
                { title: "Convert", desc: "Export to TS, Zod & more" },
              ].map((step, index, arr) => (
                <Fragment key={step.title}>
                  <div className="flex flex-1 items-center gap-4 rounded-[8px] bg-obsidian-base border-[0.5px] border-ui-border px-5 py-4 transition-colors hover:border-[#C07040]/30">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F140C] font-mono text-[14px] font-bold text-[#C07040]">
                      {index + 1}
                    </span>
                    <div className="text-left">
                      <h4 className="font-semibold text-text-primary text-[14px]">{step.title}</h4>
                      <p className="text-[12px] text-text-secondary mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                  {index < arr.length - 1 ? (
                    <span className="hidden md:inline text-[#C07040] text-xl font-bold opacity-60">&gt;</span>
                  ) : null}
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection />

        <section className="w-full max-w-300 px-4 py-12 sm:px-6 md:px-8 md:py-14">
          <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.08fr)_380px]">
            <div className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-6 sm:p-7 lg:p-8">
              <p
                className="mb-3 text-[11px] font-medium tracking-[0.04em]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Privacy-first
              </p>
              <h2
                style={{
                  fontSize: "clamp(22px, 4vw, 32px)",
                  lineHeight: "1.15",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Your JSON stays in your browser.
              </h2>
              <p
                className="mt-4"
                style={{ color: "var(--color-text-secondary)", fontSize: "15px", lineHeight: "28px" }}
              >
                Payloada is designed for payloads that developers actually care about. Formatting,
                validation, tree exploration, JWT decoding, diffing, and generation all happen in a
                privacy-first workspace without forcing you through signup.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {[
                "Local-only processing for core formatting and analysis",
                "Sensitive data scanner for tokens, emails, and secret-like fields",
                "No account needed - open the workspace and start using it immediately",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-5"
                >
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "24px" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full max-w-300 px-4 py-12 sm:px-6 md:px-8 md:py-14">
          <div className="mb-8">
            <p
              className="mb-2 text-[11px] font-medium tracking-[0.04em]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Use cases
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 4vw, 32px)",
                lineHeight: "1.15",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Built for every team that touches JSON.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map(([title, description]) => (
              <div
                key={title}
                className="group relative rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-ui-border-hover border-l-2 border-l-transparent hover:border-l-[#C07040]"
              >
                <h3
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: "18px",
                    lineHeight: "24px",
                    fontWeight: 600,
                  }}
                >
                  {title}
                </h3>
                <p
                  className="mt-3"
                  style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "24px" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-300 px-4 py-12 sm:px-6 md:px-8 md:py-14">
          <div className="mb-10 text-center md:text-left">
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C07040]"
            >
              Real workflows
            </p>
            <h2
              className="max-w-2xl text-left"
              style={{
                fontSize: "clamp(26px, 4vw, 36px)",
                lineHeight: "1.15",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              One payload, multiple workflows.
            </h2>
            <p className="mt-3 text-text-secondary max-w-xl text-[15px] text-left">
              Why paste the same JSON into five different single-purpose websites? Payloada allows you to run your entire data flow in one synced state.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Format and validate API responses",
                desc: "Paste raw or minified JSON, instantly beautify structure, and isolate exact line-level syntax failures using worker-backed parser threads.",
                badge: "Editor"
              },
              {
                title: "Search nested fields with JSONPath",
                desc: "Traverse complex arrays and deep objects instantly. Write standard JSONPath expressions with live matching values highlighted in real-time.",
                badge: "JSONPath"
              },
              {
                title: "Compare staging vs production payloads",
                desc: "Catch schema drift, regression conflicts, and value changes side-by-side with full-screen diffs and semantic addition/removal counts.",
                badge: "JSON Diff"
              },
              {
                title: "Generate TypeScript or Zod output",
                desc: "Convert clean JSON schemas into verified TypeScript interfaces, Zod validation models, Kotlin data classes, or Go structs instantly.",
                badge: "Converters"
              },
              {
                title: "Decode JWTs without leaving the editor",
                desc: "Inspect token signatures, custom claims, standard expiration dates, and secret states cleanly inside the same developer workspace.",
                badge: "JWT Decoder"
              },
              {
                title: "Mock test datasets on trusted schemas",
                desc: "Turn individual API examples into massive array fixtures with realistic names, emails, and UUID values generated on your actual shape.",
                badge: "Mock Generator"
              }
            ].map((workflow) => (
              <div
                key={workflow.title}
                className="group flex flex-col justify-between rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-6 transition-[border-color,transform] hover:border-[#C07040]"
              >
                <div className="text-left">
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-[4px] bg-[#1F140C] px-2 py-0.5 font-mono text-[10px] font-bold text-[#C07040]">
                      {workflow.badge}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-text-primary group-hover:text-copper-accent transition-colors">
                    {workflow.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {workflow.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-300 px-4 py-12 sm:px-6 md:px-8 md:py-14">
          <div className="mb-8">
            <p
              className="mb-2 text-[11px] font-medium tracking-[0.04em]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Questions
            </p>
            <h2
              style={{
                fontSize: "clamp(20px, 3.4vw, 32px)",
                lineHeight: "1.15",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Questions people ask before they trust a JSON tool.
            </h2>
          </div>

          <FaqSection items={faqs.map(([question, answer]) => ({ question, answer }))} />
        </section>
      </main>

      <Footer />
    </div>
  );
}

