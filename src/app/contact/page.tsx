import type { Metadata } from "next";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Contact - Payloada",
  description:
    "Get in touch about product feedback, bugs, privacy questions, or early access discussions for Payloada.",
};

const contacts = [
  {
    title: "Product feedback",
    description: "Share workflow pain points, missing features, or launch feedback.",
    href: "mailto:hello@payloada.dev?subject=Payloada%20product%20feedback",
    label: "hello@payloada.dev",
  },
  {
    title: "Bug reports",
    description: "Send reproducible issues, screenshots, or environment details.",
    href: "mailto:bugs@payloada.dev?subject=Payloada%20bug%20report",
    label: "bugs@payloada.dev",
  },
  {
    title: "Privacy questions",
    description: "Ask about local processing, sharing flows, or deployment behavior.",
    href: "mailto:privacy@payloada.dev?subject=Payloada%20privacy%20question",
    label: "privacy@payloada.dev",
  },
] as const;

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Talk to the team"
      intro="If you are testing Payloada, launching it internally, or just want to share feedback, these are the best channels to reach us."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <a
            key={contact.title}
            href={contact.href}
            className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated p-5 transition-colors hover:border-ui-border-hover"
          >
            <h2 className="text-base font-semibold text-text-primary">{contact.title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{contact.description}</p>
            <p className="mt-4 font-mono text-sm text-copper-accent">{contact.label}</p>
          </a>
        ))}
      </div>
    </ContentPage>
  );
}
