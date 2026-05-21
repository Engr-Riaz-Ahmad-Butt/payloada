import type { ReactNode } from "react";
import Link from "next/link";

type FaqItem = {
  q: string;
  a: string;
};

type ExampleItem = {
  title: string;
  input: string;
  outcome: string;
};

type RelatedTool = {
  href: string;
  label: string;
  description: string;
};

type ToolPageProps = {
  title: string;
  subtitle: string;
  description: readonly string[];
  faqs: readonly FaqItem[];
  useCases?: readonly string[];
  examples?: readonly ExampleItem[];
  relatedTools?: readonly RelatedTool[];
  children: ReactNode;
};

export function ToolPage({
  title,
  subtitle,
  description,
  faqs,
  useCases,
  examples,
  relatedTools,
  children,
}: ToolPageProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="min-h-screen bg-obsidian-base text-text-primary">
        <section className="border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/"
              className="text-sm text-text-tertiary transition-colors hover:text-brand"
            >
              Back to Payloada
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-text-primary">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{subtitle}</p>
          </div>
        </section>

        <section className="border-b-[0.5px] border-ui-border bg-surface">
          <div className="mx-auto h-[75vh] min-h-[720px] max-w-[1600px] px-0 lg:px-4">
            {children}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="space-y-5">
            {description.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-sm leading-7 text-text-secondary">
                {paragraph}
              </p>
            ))}
          </div>

          {useCases?.length ? (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
                Common use cases
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {useCases.map((useCase) => (
                  <div
                    key={useCase}
                    className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-5"
                  >
                    <p className="text-sm leading-7 text-text-secondary">{useCase}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {examples?.length ? (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
                Practical examples
              </h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {examples.map((example) => (
                  <div
                    key={example.title}
                    className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-5"
                  >
                    <h3 className="text-base font-medium text-text-primary">{example.title}</h3>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
                      Example input
                    </p>
                    <code className="mt-2 block rounded-md border-[0.5px] border-ui-border bg-obsidian-base px-3 py-2 font-mono text-[11px] leading-6 text-copper-accent">
                      {example.input}
                    </code>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
                      What you get
                    </p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{example.outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
              Frequently asked questions
            </h2>
            <div className="mt-6 space-y-6">
              {faqs.map(({ q, a }) => (
                <div
                  key={q}
                  className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-5"
                >
                  <h3 className="text-base font-medium text-text-primary">{q}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {relatedTools?.length ? (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
                Related tools
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-5 transition-colors hover:border-copper-accent/40"
                  >
                    <h3 className="text-base font-medium text-text-primary">{tool.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
