import type { ReactNode } from "react";
import Link from "next/link";

type ContentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function ContentPage({ eyebrow, title, intro, children }: ContentPageProps) {
  return (
    <main className="min-h-screen bg-obsidian-base text-text-primary">
      <section className="border-b-[0.5px] border-ui-border bg-surface-elevated px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
            Back to Payloada
          </Link>
          <p className="mt-4 text-[11px] font-medium tracking-[0.08em] text-outline-variant">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-text-primary sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary sm:text-[15px]">
            {intro}
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8 text-sm leading-7 text-text-secondary">
          {children}
        </div>
      </section>
    </main>
  );
}
