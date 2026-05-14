import {
  Braces,
  Bug,
  CheckCircle2,
  Database,
  FileCode2,
  FileStack,
  FolderGit2,
  KeyRound,
  Lock,
  Server,
  Sparkles,
  WandSparkles,
  Workflow,
} from "lucide-react";

import { LiveJsonWorkspace } from "@/features/workspace/components/live-json-workspace";

const featureCards = [
  {
    icon: Braces,
    title: "Format & minify",
    description: "Beautify payloads, compress responses, and keep raw and formatted views close.",
    example: "Pretty-print a webhook body, then minify it before sending it onward.",
  },
  {
    icon: CheckCircle2,
    title: "Validate & fix errors",
    description: "Catch malformed JSON with clearer explanations and quick repair actions.",
    example: "Flag trailing commas, missing quotes, and beginner mistakes without guesswork.",
  },
  {
    icon: FileCode2,
    title: "Explore tree & JSONPath",
    description: "Inspect deeply nested objects, search paths, and copy exact nodes confidently.",
    example: "Jump straight to `$.users[0].profile.email` and copy the path in one click.",
  },
  {
    icon: Bug,
    title: "Compare JSON",
    description: "Read payload changes in human terms instead of deciphering raw diffs.",
    example: "See changed values, removed keys, and type mismatches at a glance.",
  },
  {
    icon: FileStack,
    title: "Generate types & schemas",
    description: "Turn API responses into TypeScript, Zod, Schema, Prisma, or Mongoose output.",
    example: "Move from sample JSON to implementation-ready contracts in the same workspace.",
  },
  {
    icon: Database,
    title: "Convert outputs",
    description: "Switch between CSV, YAML, XML, and code output without leaving the screen.",
    example: "Export array payloads to CSV or transform nested objects into YAML instantly.",
  },
] as const;

const workflowSteps = [
  {
    title: "Paste JSON",
    description:
      "Start with API responses, fixtures, config files, webhook bodies, or copied logs.",
  },
  {
    title: "Validate",
    description: "Format the payload, check syntax, and surface issues before you keep working.",
  },
  {
    title: "Explore",
    description: "Use tree view, search, and JSONPath to find exactly the node you need.",
  },
  {
    title: "Convert",
    description: "Generate TypeScript, Schema, Zod, CSV, YAML, or XML from the same input.",
  },
  {
    title: "Download",
    description: "Copy results, export files, or pass the cleaned payload into your next step.",
  },
] as const;

const privacyPoints = [
  "Local processing for formatting, validation, tree view, diff, and conversion.",
  "Sensitive field scanner to catch secrets before export or sharing.",
  "Clear local reset flow so the workspace can be cleaned quickly.",
  "No signup required for the core developer workflow.",
] as const;

const useCases = [
  {
    icon: FolderGit2,
    title: "Frontend Developers",
    description: "Inspect API payloads, generate TypeScript interfaces, and map nested UI data.",
  },
  {
    icon: Server,
    title: "Backend Developers",
    description: "Validate contracts, compare response versions, and explore webhook bodies fast.",
  },
  {
    icon: CheckCircle2,
    title: "QA Testers",
    description: "Compare expected and actual responses, search paths, and isolate breakages.",
  },
  {
    icon: KeyRound,
    title: "Students",
    description:
      "Learn JSON structure, understand syntax errors, and inspect sample payloads safely.",
  },
  {
    icon: Workflow,
    title: "DevOps Engineers",
    description:
      "Review deployment payloads, config blobs, and environment metadata with confidence.",
  },
  {
    icon: Database,
    title: "Data Analysts",
    description:
      "Convert arrays to CSV, understand large exports, and inspect nested data sources.",
  },
] as const;

const seoLinks = [
  "JSON Formatter",
  "JSON Validator",
  "JSON Tree Viewer",
  "JSON Diff",
  "JSON to TypeScript",
  "JSON to Zod",
  "JSONPath Finder",
  "JWT Decoder",
] as const;

const faqs = [
  {
    question: "Is jsonLines only a formatter?",
    answer:
      "No. It is designed as a JSON workspace that combines formatting, validation, tree exploration, diffing, searching, and conversion in one flow.",
  },
  {
    question: "Is my JSON uploaded anywhere?",
    answer:
      "The core workflow is local-first. Formatting, validation, inspection, and conversion happen in the browser unless you explicitly choose a future sharing feature.",
  },
  {
    question: "Can I convert JSON to TypeScript or Zod?",
    answer:
      "Yes. jsonLines includes integrated TypeScript, Zod, Schema, Prisma, Mongoose, CSV, YAML, and XML generation inside the workspace.",
  },
  {
    question: "Can I compare two JSON payloads?",
    answer:
      "Yes. The diff mode is built into the workspace and focuses on human-readable change summaries instead of raw-only output.",
  },
  {
    question: "Is it useful for beginners too?",
    answer:
      "Yes. Friendly validation messaging, guided empty states, and sample payloads make it approachable for students and less experienced developers.",
  },
  {
    question: "Why keep the tool on the homepage?",
    answer:
      "Because the product should start working immediately. The homepage is meant to be a real entry point into the tool, not just a marketing wrapper.",
  },
] as const;

function SectionFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-[#262626] bg-[#121212]">
      <div className="border-b border-[#262626] px-5 py-5 sm:px-6">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b8a69a]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[28px] leading-tight font-semibold tracking-tight text-[#f5f1ea] sm:text-[32px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#b8a69a]">{description}</p>
        ) : null}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

export function WorkspaceContent() {
  return (
    <main className="flex-1">
      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <section className="rounded-sm border border-[#262626] bg-[#121212]">
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="space-y-8 px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
              <div className="inline-flex items-center gap-2 rounded-sm border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#d6c3b5]">
                <Sparkles className="size-3.5 text-[#c07040]" />
                Local-first JSON workspace
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <h1 className="max-w-4xl text-[36px] leading-[1.02] font-semibold tracking-[-0.03em] text-[#f5f1ea] sm:text-[44px] lg:text-[56px]">
                    Format, validate, explore, and convert JSON faster.
                  </h1>
                  <p className="max-w-3xl text-[15px] leading-7 text-[#b8a69a] sm:text-base">
                    Paste JSON, upload a file, or fetch an API response. View it as a tree, fix
                    errors, compare versions, and generate TypeScript, Zod, CSV, YAML, and XML
                    outputs.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 rounded-sm bg-[#c77742] px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#d28550]">
                    <WandSparkles className="size-4" />
                    Try JSON Tool
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-sm border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-2.5 text-sm font-semibold text-[#f5f1ea] transition-colors hover:border-[#c07040]">
                    <Braces className="size-4 text-[#c07040]" />
                    Use Sample JSON
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-3 text-[13px] font-medium text-[#d6c3b5]">
                {["Local processing", "No signup", "Dark mode", "Developer shortcuts"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#c07040]" />
                      <span>{item}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="border-t border-[#262626] bg-[#0d0d0d] px-5 py-8 sm:px-6 xl:border-t-0 xl:border-l">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b8a69a]">
                  <Sparkles className="size-3.5 text-[#c07040]" />
                  Mini UI preview
                </div>

                <div className="rounded-sm border border-[#262626] bg-[#080808]">
                  <div className="flex items-center justify-between border-b border-[#262626] px-4 py-3">
                    <p className="font-mono text-[12px] text-[#d6c3b5]">preview.json</p>
                    <span className="rounded-sm border border-[#32593a] bg-[#0d1510] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8ed08e]">
                      Valid JSON
                    </span>
                  </div>

                  <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_152px]">
                    <div className="border-b border-[#262626] p-4 lg:border-r lg:border-b-0">
                      <pre className="overflow-hidden font-mono text-[12px] leading-6 text-[#f5f1ea]">
                        <span>{`{`}</span>
                        {"\n"}
                        <span className="text-[#d6c3b5]">{`  "users": [`}</span>
                        {"\n"}
                        <span className="text-[#7db87d]">{`    { "email": "aisha@jsonlines.dev" }`}</span>
                        {"\n"}
                        <span className="text-[#d6c3b5]">{`  ],`}</span>
                        {"\n"}
                        <span className="text-[#d6c3b5]">{`  "meta": { "count": 1 }`}</span>
                        {"\n"}
                        <span>{`}`}</span>
                      </pre>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b8a69a]">
                        Tree viewer
                      </p>
                      <div className="mt-3 space-y-2 font-mono text-[12px] text-[#d6c3b5]">
                        <p>users</p>
                        <p className="pl-3">[0]</p>
                        <p className="pl-6 text-[#f5f1ea]">email</p>
                        <p>meta</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#262626] px-4 py-3">
                    <button className="inline-flex items-center gap-2 rounded-sm border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#d6c3b5] transition-colors hover:border-[#c07040]">
                      <FileCode2 className="size-3.5 text-[#c07040]" />
                      Copy JSONPath
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LiveJsonWorkspace />

        <SectionFrame
          eyebrow="Features"
          title="A serious JSON workflow, not a one-button formatter"
          description="The best experience is not about cramming every action on screen. Keep the common path obvious, then let deeper tooling unfold naturally."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description, example }) => (
              <div
                key={title}
                className="rounded-sm border border-[#262626] bg-[#0d0d0d] p-5 transition-colors hover:border-[#3a2c24]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm bg-[#1f1f1f] text-[#c07040]">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-[19px] font-semibold text-[#f5f1ea]">{title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-[#b8a69a]">{description}</p>
                <p className="mt-4 border-t border-[#262626] pt-4 text-[13px] leading-6 text-[#d6c3b5]">
                  {example}
                </p>
              </div>
            ))}
          </div>
        </SectionFrame>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <SectionFrame
            eyebrow="Workflow"
            title="Paste → Validate → Explore → Convert → Download"
            description="jsonLines should feel like a compact control room for developer payload work."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-sm border border-[#262626] bg-[#0d0d0d] p-5"
                >
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#c77742] text-sm font-semibold text-black">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-semibold text-[#f5f1ea]">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#b8a69a]">{step.description}</p>
                </div>
              ))}
            </div>
          </SectionFrame>

          <SectionFrame
            eyebrow="Privacy"
            title="Your JSON stays in your browser."
            description="Privacy is a product feature here, not a tiny disclaimer buried in a footer."
          >
            <div className="space-y-3">
              {privacyPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-sm border border-[#262626] bg-[#0d0d0d] p-4"
                >
                  <Lock className="mt-0.5 size-4 text-[#c07040]" />
                  <p className="text-[14px] leading-6 text-[#d6c3b5]">{point}</p>
                </div>
              ))}
            </div>
          </SectionFrame>
        </div>

        <SectionFrame
          eyebrow="Use Cases"
          title="Built for real day-to-day JSON work"
          description="Different roles care about different outputs. The workspace adapts without turning into a cluttered tool farm."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-sm border border-[#262626] bg-[#0d0d0d] p-5 transition-colors hover:border-[#3a2c24]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm bg-[#1f1f1f] text-[#c07040]">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#f5f1ea]">{title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-[#b8a69a]">{description}</p>
              </div>
            ))}
          </div>
        </SectionFrame>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <SectionFrame
            eyebrow="What Is jsonLines?"
            title="A homepage that works like a product entry point"
            description="This should read like a trustworthy developer workspace, not a generic formatter landing page."
          >
            <div className="space-y-4 text-[15px] leading-7 text-[#b8a69a]">
              <p>
                jsonLines is a modern developer workspace for formatting, validating, exploring,
                comparing, converting, and understanding JSON faster. The homepage keeps the live
                tool above the fold so people can start working immediately.
              </p>
              <p>
                Instead of pushing users through a maze of disconnected pages too early, the product
                introduces the real workspace first, then supports it with tool discovery,
                role-based guidance, privacy positioning, and educational content around JSON syntax
                and structure.
              </p>
            </div>
          </SectionFrame>

          <SectionFrame
            eyebrow="Internal Tool Map"
            title="Important SEO and route pathways"
            description="These routes help users and search engines understand the product surface area."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {seoLinks.map((link) => (
                <div
                  key={link}
                  className="rounded-sm border border-[#262626] bg-[#0d0d0d] px-4 py-3 text-sm font-medium text-[#d6c3b5]"
                >
                  {link}
                </div>
              ))}
            </div>
          </SectionFrame>
        </div>

        <SectionFrame
          eyebrow="FAQ"
          title="Questions users ask before trusting a JSON tool"
          description="Good answers here matter for both confidence and discoverability."
        >
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-sm border border-[#262626] bg-[#0d0d0d] p-5"
              >
                <h3 className="text-lg font-semibold text-[#f5f1ea]">{faq.question}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#b8a69a]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </SectionFrame>
      </div>
    </main>
  );
}
