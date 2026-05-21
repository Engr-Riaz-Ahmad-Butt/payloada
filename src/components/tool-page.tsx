import type { ReactNode } from "react";
import Link from "next/link";

type FaqItem = {
  q: string;
  a: string;
};

type ToolPageProps = {
  title: string;
  subtitle: string;
  description: readonly string[];
  faqs: readonly FaqItem[];
  children: ReactNode;
};

export function ToolPage({ title, subtitle, description, faqs, children }: ToolPageProps) {
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
        </section>
      </main>
    </>
  );
}
