import type { Metadata } from "next";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Terms - Payloada",
  description:
    "Read the general product usage terms, limitations, and service expectations for Payloada.",
};

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Terms"
      title="Product use terms"
      intro="These terms describe the general expectations around using Payloada. They are written clearly so early users understand product scope, responsibility, and service boundaries."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Use of the product</h2>
        <p>
          Payloada is provided as a developer productivity product for working with JSON, payloads,
          schemas, tokens, and related data structures. You may use it for lawful development,
          debugging, learning, and internal workflow purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">No warranty</h2>
        <p>
          We aim to make Payloada reliable, but the product is provided on an as-is basis during
          early rollout. You are responsible for reviewing generated output, validation results,
          diffs, AI suggestions, and exported artifacts before relying on them in production.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Availability and limits</h2>
        <p>
          Features may change, rate limits may apply, and some integrations such as AI providers
          may depend on external services. We may improve, pause, or remove features as the product
          evolves.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Responsible use</h2>
        <p>
          Do not use the product to abuse third-party services, process data you are not allowed to
          handle, or attempt to interfere with system stability or security.
        </p>
      </section>
    </ContentPage>
  );
}
