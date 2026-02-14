import { siteConfig } from "@/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description: `Privacy policy for ${siteConfig.name}. Learn how your data is handled — locally, in your browser, with no servers involved.`,
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">
        Last updated: February 14, 2026
      </p>

      <div className="mt-10 space-y-8 text-foreground/90 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p>
            {siteConfig.name} is a privacy-first, local-only Gmail analytics
            tool. We do not operate servers that receive, store, or process your
            email data. Everything runs entirely in your web browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Data We Do Not Collect</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              We do not collect, transmit, or store your emails or email content.
            </li>
            <li>We do not collect your Google account credentials or tokens on any server.</li>
            <li>We do not use cookies for tracking or advertising.</li>
            <li>We do not sell, share, or monetize your data in any form.</li>
            <li>We do not use analytics services that track individual users.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How Your Data Is Handled</h2>
          <p>
            When you connect your Gmail account, the following happens entirely
            within your browser:
          </p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              <strong>Authentication:</strong> You sign in via Google Identity
              Services. The OAuth access token is stored in browser memory only
              and expires after approximately one hour. We never see or store
              this token on any server.
            </li>
            <li>
              <strong>Email fetching:</strong> Your browser makes direct API
              calls to Gmail using your access token. Email data travels from
              Google directly to your browser — it never passes through our
              infrastructure.
            </li>
            <li>
              <strong>Local storage:</strong> Fetched emails and parsed results
              are stored in your browser&apos;s IndexedDB. This data exists only on
              your device and is never transmitted anywhere.
            </li>
            <li>
              <strong>AI parsing (optional):</strong> If you configure an AI
              provider, email content is sent to the provider you choose (e.g.,
              a local Ollama instance, OpenAI, or Anthropic). This is a direct
              connection between your browser and your chosen provider. We are
              not involved in this communication. If you use a local model like
              Ollama, your data never leaves your machine.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Google API Scopes</h2>
          <p>
            We request the <code className="rounded bg-muted px-1.5 py-0.5 text-sm">gmail.readonly</code> scope only. This grants
            read-only access to your emails. We cannot send, delete, modify, or
            manage your emails or Gmail settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">
            Google API Services User Data Policy
          </h2>
          <p>
            {siteConfig.name}&apos;s use and transfer to any other app of information
            received from Google APIs will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Third-Party AI Providers</h2>
          <p>
            If you choose to use a cloud-based AI provider (OpenAI or
            Anthropic), portions of your email content will be sent to that
            provider for classification and extraction. This is your choice and
            configured by you. Each provider has their own privacy policy:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Ollama (local):</strong> Runs entirely on your machine. No
              data leaves your device.
            </li>
            <li>
              <strong>OpenAI:</strong> Subject to{" "}
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                OpenAI&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Anthropic:</strong> Subject to{" "}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Anthropic&apos;s Privacy Policy
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Data Deletion</h2>
          <p>
            Since all data is stored locally in your browser, you have full
            control:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Use the &quot;Clear all data&quot; button in Settings to delete everything.</li>
            <li>Clear your browser&apos;s site data for this domain.</li>
            <li>
              Revoke access via your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Google Account permissions
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Open Source</h2>
          <p>
            This application is open source. You can audit the full source code
            at{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              GitHub
            </a>{" "}
            to verify these claims.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Changes will be posted
            on this page with an updated date. Since we don&apos;t collect email
            addresses, we cannot notify you directly — please check back
            periodically.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p>
            If you have questions about this privacy policy, you can open an
            issue on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
