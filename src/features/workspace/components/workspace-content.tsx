import {
  Braces,
  Bug,
  CheckCircle2,
  Copy,
  Database,
  FileCode2,
  FileStack,
  FolderGit2,
  KeyRound,
  Lock,
  PanelsTopLeft,
  Search,
  Server,
  Sparkles,
  WandSparkles,
  Workflow,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveJsonWorkspace } from "@/features/workspace/components/live-json-workspace";

const featureCards = [
  {
    icon: PanelsTopLeft,
    title: "Format & minify",
    description: "Beautify or compress payloads instantly without leaving the workspace.",
    example: "Pretty-print a webhook body, then minify it for transport.",
  },
  {
    icon: Search,
    title: "Validate & fix errors",
    description:
      "Catch syntax issues with friendlier explanations, suggestions, and highlight actions.",
    example: "Explain trailing commas, missing quotes, and invalid comments.",
  },
  {
    icon: FileCode2,
    title: "Explore tree & JSONPath",
    description: "Inspect nested objects visually, copy exact paths, and search values faster.",
    example: "Jump straight to `$.users[0].profile.email`.",
  },
  {
    icon: Bug,
    title: "Compare JSON",
    description:
      "Compare expected and actual payloads with human-readable summaries instead of raw diffs.",
    example: "See type mismatches, changed fields, and removed keys at a glance.",
  },
  {
    icon: FileStack,
    title: "Generate types & schemas",
    description:
      "Move from raw payloads to TypeScript, Zod, JSON Schema, Prisma, and Mongoose output in one place.",
    example: "Turn API responses into implementation-ready contracts.",
  },
  {
    icon: Database,
    title: "Convert to CSV / YAML / XML",
    description:
      "Switch formats inside the output panel instead of bouncing across separate converter pages.",
    example: "Export array responses to CSV or turn nested JSON into YAML.",
  },
] as const;

const workflowSteps = [
  {
    title: "Paste or import JSON",
    description: "Start with API responses, config files, webhook payloads, or saved fixtures.",
  },
  {
    title: "Format and validate",
    description:
      "Instantly beautify the payload, catch syntax issues, and highlight parsing problems.",
  },
  {
    title: "Inspect and extract",
    description: "Use search, tree exploration, and JSONPath to find the exact node you need.",
  },
  {
    title: "Generate or export",
    description: "Move into code generation, schema creation, downloads, or team-ready handoff.",
  },
] as const;

const privacyPoints = [
  "Local processing for formatting, validation, tree view, diff, and conversion.",
  "Sensitive field scanner to detect secrets before sharing or exporting.",
  "Clear local data flow so the workspace can be reset quickly when needed.",
  "No signup required for the core developer workflow.",
] as const;

const useCases = [
  {
    icon: FolderGit2,
    title: "Frontend developers",
    description: "Inspect API payloads, generate TypeScript types, and map nested data faster.",
  },
  {
    icon: Server,
    title: "Backend developers",
    description:
      "Validate contracts, explore webhooks, compare payload changes, and document responses.",
  },
  {
    icon: CheckCircle2,
    title: "QA testers",
    description:
      "Search through large responses, verify shape changes, and isolate breaking fields quickly.",
  },
  {
    icon: KeyRound,
    title: "Students",
    description:
      "Learn JSON structure, fix common mistakes, and understand APIs without a heavy setup.",
  },
  {
    icon: Workflow,
    title: "DevOps engineers",
    description:
      "Inspect config payloads, validate deployment metadata, and compare environment responses safely.",
  },
  {
    icon: Database,
    title: "Data analysts",
    description:
      "Convert arrays to CSV, inspect schemas quickly, and understand deeply nested export files.",
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
    question: "What makes JSONLens different from older JSON formatter tools?",
    answer:
      "JSONLens is designed as a developer workspace, not just a beautifier. The goal is to combine formatting, validation, exploration, search, privacy messaging, and generators in one modern flow.",
  },
  {
    question: "Will the main JSON tool stay visible on the homepage?",
    answer:
      "Yes. The homepage is intended to include the real tool above the fold so people can start immediately instead of navigating through a marketing-only landing page first.",
  },
  {
    question: "Is JSONLens built for sensitive API payloads?",
    answer:
      "The product direction is privacy-first and local-first, which is especially important when developers need to inspect tokens, webhook payloads, and internal business data.",
  },
  {
    question: "Can I convert JSON to TypeScript?",
    answer:
      "Yes. JSONLens includes integrated converter output for TypeScript, Zod, JSON Schema, Prisma, Mongoose, CSV, YAML, and XML without forcing you into a separate disconnected page.",
  },
  {
    question: "Can I compare two JSON files?",
    answer:
      "Yes. The diff workspace is built into the tool and focuses on human-readable summaries like changed values, added fields, removed fields, and type mismatches.",
  },
  {
    question: "Can I upload large JSON files?",
    answer:
      "Yes. The UI is designed to show meaningful loading states and prepare users for larger payload handling instead of failing silently.",
  },
  {
    question: "Who is the product mainly for?",
    answer:
      "The primary audience is frontend developers, backend developers, QA engineers, students, DevOps engineers, and data-focused technical users who need a clearer JSON workflow every day.",
  },
] as const;

export function WorkspaceContent() {
  return (
    <main className="flex-1 py-6">
      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.82fr)]">
          <Card className="overflow-hidden rounded-[var(--radius-xl)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border">
            <CardContent className="px-0 py-0">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-8 px-6 py-8 lg:px-8 lg:py-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[13px] font-medium text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    Local-first JSON workspace
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <h2 className="max-w-2xl text-[34px] leading-[1.02] font-semibold tracking-tight sm:text-[42px] lg:text-[56px]">
                        Format, validate, explore, and convert JSON faster.
                      </h2>
                      <p className="max-w-2xl text-[15px] leading-7 text-[var(--text-secondary)] md:text-base">
                        Paste JSON, upload a file, or fetch an API response. View it as a tree, fix
                        errors, compare versions, and generate TypeScript, Zod, CSV, YAML, and XML
                        outputs.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="inline-flex items-center gap-2 rounded-[var(--radius-input)] bg-[image:var(--primary-gradient)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-floating)]">
                        <WandSparkles className="size-4" />
                        Try JSON Tool
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-[var(--radius-input)] border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground">
                        <Braces className="size-4 text-primary" />
                        Use Sample JSON
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
                    {["Local processing", "No signup", "Dark mode", "Developer shortcuts"].map(
                      (item) => (
                        <div key={item} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary" />
                          <span>{item}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="border-t border-border bg-secondary/70 px-6 py-8 lg:border-l lg:border-t-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      <PanelsTopLeft className="size-3.5 text-primary" />
                      Mini UI preview
                    </div>

                    <div className="rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-[var(--shadow-workspace)]">
                      <div className="space-y-4">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px]">
                          <div className="rounded-[var(--radius-card)] border border-border bg-[var(--editor-background)] p-3">
                            <div className="space-y-2 font-mono text-[13px] leading-6 text-[var(--text-secondary)]">
                              <p>{`{`}</p>
                              <p className="pl-3">{`"users": [{ "email": "aisha@jsonlens.dev" }],`}</p>
                              <p className="pl-3">{`"meta": { "count": 1, "status": "ok" }`}</p>
                              <p>{`}`}</p>
                            </div>
                          </div>
                          <div className="rounded-[var(--radius-card)] border border-border bg-background p-3">
                            <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                              Tree viewer
                            </p>
                            <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                              <p>users</p>
                              <p className="pl-3">0</p>
                              <p className="pl-6 text-foreground">email</p>
                              <p>meta</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="rounded-full bg-[#DCFCE7] px-3 py-1.5 text-[13px] font-medium text-[#166534] dark:bg-[#052e24] dark:text-[#6ee7b7]">
                            Valid JSON
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[13px] font-medium text-foreground">
                            <Copy className="size-3.5 text-primary" />
                            Copy JSONPath
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <LiveJsonWorkspace />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(({ icon: Icon, title, description, example }) => (
            <Card
              key={title}
              className="rounded-[var(--radius-lg)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border"
            >
              <CardContent className="space-y-4 px-6 py-6">
                <div className="flex size-11 items-center justify-center rounded-[var(--radius-card)] bg-[image:var(--primary-gradient)] text-white">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[20px] font-semibold text-foreground">{title}</h3>
                  <p className="text-[15px] leading-6 text-muted-foreground">{description}</p>
                  <p className="text-[13px] leading-6 text-[var(--text-secondary)]">{example}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <Card className="rounded-[var(--radius-xl)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border">
            <CardHeader className="border-b border-border px-6 py-6">
              <CardTitle className="text-[28px]">Workflow section</CardTitle>
              <CardDescription>
                A cleaner flow from raw payload to insight, repair, and output.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[var(--radius-card)] border border-border bg-secondary p-5"
                  >
                    <div className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-[image:var(--primary-gradient)] text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-xl)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border">
            <CardHeader className="border-b border-border px-6 py-6">
              <CardTitle className="text-[28px]">Privacy section</CardTitle>
              <CardDescription>Your JSON stays in your browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-6 py-6">
              <p className="text-[15px] leading-7 text-muted-foreground">
                Formatting, validation, tree view, diff, and conversions run locally. We do not
                upload or store your JSON unless you explicitly choose future sharing or AI
                features.
              </p>
              {privacyPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-secondary p-4"
                >
                  <Lock className="mt-0.5 size-4 text-primary" />
                  <p className="text-[15px] leading-6 text-foreground">{point}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-[13px] uppercase tracking-[0.16em] text-muted-foreground">
              Use cases
            </p>
            <h2 className="text-[32px] font-semibold tracking-tight text-foreground">
              Built for real day-to-day JSON work
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="rounded-[var(--radius-lg)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border"
              >
                <CardContent className="space-y-4 px-6 py-6">
                  <div className="flex size-11 items-center justify-center rounded-[var(--radius-card)] bg-secondary text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-[15px] leading-6 text-muted-foreground">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="rounded-[var(--radius-xl)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border">
            <CardHeader className="border-b border-border px-6 py-6">
              <CardTitle className="text-[28px]">SEO content section</CardTitle>
              <CardDescription>
                The homepage should still help search engines understand tool coverage and product
                scope.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 py-6">
              <p className="text-[15px] leading-7 text-muted-foreground">
                JSONLens is positioned as a modern developer workspace for formatting, validating,
                exploring, comparing, converting, and understanding JSON faster. Instead of forcing
                users into separate disconnected pages too early, the homepage introduces the real
                tool experience first and then supports it with clear internal pathways.
              </p>
              <p className="text-[15px] leading-7 text-muted-foreground">
                The strongest homepage structure mixes product usability with search clarity:
                formatters, validators, tree viewers, diff tools, generators, JSONPath utilities,
                JWT debugging, privacy-first messaging, and educational resources around JSON syntax
                and schema concepts.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-xl)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border">
            <CardHeader className="border-b border-border px-6 py-6">
              <CardTitle className="text-[28px]">Internal tool map</CardTitle>
              <CardDescription>
                Important keyword pathways and future route structure.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {seoLinks.map((link) => (
                  <div
                    key={link}
                    className="rounded-[var(--radius-card)] border border-border bg-secondary px-4 py-3 text-sm font-medium text-foreground"
                  >
                    {link}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-[13px] uppercase tracking-[0.16em] text-muted-foreground">FAQ</p>
            <h2 className="text-[32px] font-semibold tracking-tight text-foreground">
              Questions users will ask before trusting the tool
            </h2>
          </div>

          <div className="grid gap-4">
            {faqs.map((faq) => (
              <Card
                key={faq.question}
                className="rounded-[var(--radius-lg)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border"
              >
                <CardContent className="space-y-3 px-6 py-6">
                  <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                  <p className="text-[15px] leading-7 text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
