import type { Metadata } from "next";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Privacy - Payloada",
  description:
    "Understand how Payloada handles JSON data, browser-local workflows, sharing, and AI requests.",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Privacy"
      title="Privacy-first by default"
      intro="Payloada is built to keep core JSON workflows local to your browser. This page explains what stays local, what can leave the browser, which features rely on external services, and what you should assume when using the product in beta."
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">What stays local</h2>
        <p>
          Formatting, validation, tree exploration, graph view, diffing, JWT inspection,
          converters, mock generation, table view, and most editing workflows are designed to run
          locally in your browser.
        </p>
        <p>
          We do not need to upload your JSON for those core features to work. That is an important
          trust promise of the product.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">When data may leave the browser</h2>
        <p>
          Some features are different by nature. If you explicitly use AI assistance, your prompt
          and relevant JSON context can be sent to the configured AI provider through the app
          backend. If you explicitly use sharing features, the data involved in that sharing flow
          may also leave the browser depending on how the feature is configured in deployment.
        </p>
        <p>
          In short: local-first is the default, but features you intentionally invoke may use
          network requests.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">AI and external providers</h2>
        <p>
          AI features are optional. If you use them, the selected prompt and the JSON context sent
          for analysis are processed by the configured model provider. That means AI actions should
          be treated differently from local tools like formatting or validation.
        </p>
        <p>
          If your payload contains credentials, secrets, personal data, or customer records, avoid
          sending it to AI features unless you have already redacted the sensitive parts and are
          comfortable with the external processing involved.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Sharing and saved links</h2>
        <p>
          Sharing is never assumed silently. If a deployment offers link creation or related
          workflows, that data should be treated as intentionally transmitted rather than
          automatically local-only.
        </p>
        <p>
          During beta, you should assume shared data is only appropriate for non-sensitive payloads
          unless the deployment clearly documents stronger privacy controls.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Analytics and logs</h2>
        <p>
          The app can be deployed with privacy-respecting analytics such as Plausible. Those
          analytics are intended to track page usage rather than store your JSON documents.
        </p>
        <p>
          Operational logs may include standard request metadata needed to keep the application
          secure and stable, especially for server-side AI or rate-limited routes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Data retention and support</h2>
        <p>
          The core product is designed so normal browser-side JSON work does not require stored
          documents on our side. Operational logs may still exist for uptime, debugging, abuse
          prevention, and rate limiting on server-backed features.
        </p>
        <p>
          If you have deployment-specific privacy questions, contact us before sending sensitive
          production data through any network-backed feature.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Your responsibility</h2>
        <p>
          If you are handling production secrets, access tokens, or customer data, you should use
          caution even in local-first tools. Review which features are enabled, avoid unnecessary
          sharing, and use redaction where appropriate.
        </p>
      </section>
    </ContentPage>
  );
}
