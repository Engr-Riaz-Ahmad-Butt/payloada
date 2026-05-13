import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE, MVP_FEATURES } from "@/constants";
import { workspaceSections } from "@/features/workspace/config/workspace-sections";
import { plannedConverters } from "@/lib/converters";

export function WorkspaceShell() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.08),_transparent_35%),linear-gradient(180deg,_var(--background),_color-mix(in_oklab,var(--background),white_18%))]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 lg:max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {APP_TAGLINE}
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {APP_NAME}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {APP_DESCRIPTION}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {MVP_FEATURES.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-border/70 bg-background/85 p-4 text-sm text-muted-foreground"
              >
                {feature}
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Target structure
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Feature-oriented workspace foundation
                </h2>
              </div>
              <div className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
                App Router + TypeScript + Zustand
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {workspaceSections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-2xl border border-border/70 bg-background/75 p-5"
                >
                  <h3 className="text-base font-semibold">{section.title}</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Planned converter modules
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Structured extension points
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {Object.entries(plannedConverters).map(([key, description]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-border/70 bg-background/75 p-4"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {key}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
