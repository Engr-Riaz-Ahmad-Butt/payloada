import {
  BellDot,
  Braces,
  FileJson2,
  MoonStar,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/constants";

const navItems = ["Formatter", "Validator", "Tree View", "Diff", "Generators"];

const statusItems = [
  { label: "Mode", value: "Local only" },
  { label: "Theme", value: "System" },
  { label: "Target", value: "MVP shell" },
] as const;

const quickActions = [
  {
    icon: WandSparkles,
    label: "Format",
    tone: "bg-[#DCFCE7] text-[#166534] dark:bg-[#052e24] dark:text-[#6ee7b7]",
  },
  {
    icon: Search,
    label: "Search",
    tone: "bg-[#E0F2FE] text-[#075985] dark:bg-[#082f49] dark:text-[#67e8f9]",
  },
  {
    icon: Braces,
    label: "JSONPath",
    tone: "bg-[#FEF3C7] text-[#92400E] dark:bg-[#451a03] dark:text-[#fbbf24]",
  },
  {
    icon: ShieldCheck,
    label: "Validate",
    tone: "bg-[#FEE2E2] text-[#991B1B] dark:bg-[#450a0a] dark:text-[#fca5a5]",
  },
] as const;

const outputCards = [
  {
    title: "Parsed tree output",
    description: "Expandable tree view, path copy, and selected node details will render here.",
  },
  {
    title: "Validation and stats",
    description: "Friendly parsing errors, document metrics, and future schema results live here.",
  },
] as const;

export function WorkspaceShell() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_var(--background),_color-mix(in_srgb,var(--background),white_14%))] dark:bg-[linear-gradient(180deg,_var(--background),_color-mix(in_srgb,var(--background),white_4%))]">
      <div className="flex min-h-screen w-full flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 rounded-[var(--radius-xl)] border border-border bg-[var(--header-background)] shadow-[var(--shadow-workspace)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-[var(--radius-card)] bg-[image:var(--primary-gradient)] text-primary-foreground shadow-[var(--shadow-floating)]">
                  <FileJson2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    {APP_TAGLINE}
                  </p>
                  <div>
                    <h1 className="text-[36px] leading-none font-semibold sm:text-[40px] lg:text-[44px]">
                      {APP_NAME}
                    </h1>
                    <p className="max-w-2xl text-[15px] leading-6 text-[var(--text-secondary)] md:text-base">
                      {APP_DESCRIPTION}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm">
                  <MoonStar />
                  Theme
                </Button>
                <Button variant="outline" size="sm">
                  <BellDot />
                  Updates
                </Button>
                <Button size="sm">
                  <Sparkles />
                  New Snippet
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-[var(--radius)] border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white hover:text-foreground dark:hover:bg-[#0b1324]"
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="flex flex-wrap gap-2">
                {statusItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">{item.label}:</span> {item.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.9fr)]">
            <section className="space-y-6">
              <Card className="rounded-[var(--radius-lg)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border">
                <CardHeader className="gap-3 border-b border-border px-6 py-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle className="text-[20px]">Editor workspace</CardTitle>
                      <CardDescription>
                        Main input area for raw JSON, formatting controls, and file actions.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map(({ icon: Icon, label, tone }) => (
                        <div
                          key={label}
                          className={`inline-flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-[13px] font-medium ${tone}`}
                        >
                          <Icon className="size-3.5" />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6 pt-6">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="min-h-[430px] rounded-[var(--radius-lg)] border border-dashed border-border bg-[var(--editor-background)] p-6">
                      <div className="flex h-full flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <PanelsTopLeft className="size-4 text-muted-foreground" />
                            Editor placeholder
                          </div>
                          <p className="max-w-2xl text-[15px] leading-6 text-muted-foreground">
                            Monaco editor will mount here with formatting, validation, upload,
                            paste, and keyboard-shortcut support.
                          </p>
                        </div>

                        <div className="rounded-[var(--radius-card)] border border-border bg-background p-4">
                          <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
                            <div>
                              <p className="font-medium text-foreground">Input mode</p>
                              <p>Paste, import, drag and drop</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Formatting</p>
                              <p>2 spaces, 4 spaces, tabs, minify</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Persistence</p>
                              <p>Local draft restore and privacy notice</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-[var(--radius-card)] border border-border bg-secondary p-4">
                        <p className="text-sm font-medium text-foreground">Action rail</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Buttons for format, minify, validate, clear, download, and import will
                          stack here on desktop and collapse naturally on smaller screens.
                        </p>
                      </div>
                      <div className="rounded-[var(--radius-card)] border border-border bg-secondary p-4">
                        <p className="text-sm font-medium text-foreground">Examples and presets</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Starter payloads, webhook templates, and saved local drafts can plug in
                          here later.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <aside className="space-y-6">
              {outputCards.map((card) => (
                <Card
                  key={card.title}
                  className="rounded-[var(--radius-lg)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border"
                >
                  <CardHeader className="border-b border-border px-6 py-6">
                    <CardTitle className="text-[20px]">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 py-6">
                    <div className="min-h-[220px] rounded-[var(--radius-card)] border border-dashed border-border bg-secondary p-4">
                      <div className="flex h-full flex-col justify-between">
                        <p className="text-sm leading-6 text-muted-foreground">
                          Placeholder panel for the upcoming output module.
                        </p>
                        <div className="rounded-[var(--radius-card)] border border-border bg-background p-3 text-[13px] text-muted-foreground">
                          Ready for real component wiring in the next task.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="rounded-[var(--radius-lg)] border-0 bg-card py-0 shadow-[var(--shadow-workspace)] ring-1 ring-border">
                <CardHeader className="border-b border-border px-6 py-6">
                  <CardTitle className="text-[20px]">Responsive behavior</CardTitle>
                  <CardDescription>
                    Desktop keeps editor and output side by side. Tablet and mobile stack panels
                    vertically for easier scanning.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-between gap-3 px-6">
                  <span className="text-sm text-muted-foreground">Container max width</span>
                  <span className="rounded-[var(--radius)] border border-border bg-secondary px-3 py-1.5 text-[13px] text-foreground">
                    Full workspace width
                  </span>
                </CardFooter>
              </Card>
            </aside>
          </div>
        </main>

        <footer className="mt-auto border-t border-border py-5">
          <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>
              {APP_NAME} is structured as a privacy-first JSON workspace with room for editor, tree,
              diff, schema, and API debugging modules.
            </p>
            <div className="flex flex-wrap gap-4">
              <span>Responsive shell ready</span>
              <span>Tool panels staged</span>
              <span>Next step: real editor wiring</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
