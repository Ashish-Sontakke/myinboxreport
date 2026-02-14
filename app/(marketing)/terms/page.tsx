import { siteConfig } from "@/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Terms of Service - ${siteConfig.name}`,
  description: `Terms of service for ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-muted-foreground">
        Last updated: February 14, 2026
      </p>

      <div className="mt-10 space-y-8 text-foreground/90 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {siteConfig.name} (&quot;the Service&quot;), you agree to
            be bound by these Terms of Service. If you do not agree to these
            terms, do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">2. Description of Service</h2>
          <p>
            {siteConfig.name} is a free, open-source, client-side web
            application that connects to your Gmail account via Google&apos;s OAuth
            system to provide analytics on your email data. The Service runs
            entirely in your browser. We do not operate backend servers that
            process your data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">3. Google Account Access</h2>
          <p>
            To use the Service, you must authorize read-only access to your
            Gmail account via Google Identity Services. By doing so:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              You represent that you have the authority to grant this access.
            </li>
            <li>
              You understand the Service will read your email messages locally in
              your browser.
            </li>
            <li>
              You can revoke access at any time via your{" "}
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
          <h2 className="text-2xl font-semibold">4. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Use the Service only for lawful purposes.</li>
            <li>
              Not attempt to reverse-engineer, exploit, or misuse the Service.
            </li>
            <li>
              Keep your API keys (if using cloud AI providers) secure and not
              share them.
            </li>
            <li>
              Comply with Google&apos;s{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                API Services User Data Policy
              </a>{" "}
              when using data obtained through the Service.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">
            5. Third-Party AI Providers
          </h2>
          <p>
            The Service allows you to optionally configure third-party AI
            providers (OpenAI, Anthropic, or local Ollama) for email parsing. If
            you choose to use a cloud-based provider:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              You are responsible for providing your own API key and for any
              costs incurred.
            </li>
            <li>
              Your email data will be sent directly from your browser to the
              provider. We are not a party to this communication.
            </li>
            <li>
              You are subject to that provider&apos;s terms of service and privacy
              policy.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">6. Data and Privacy</h2>
          <p>
            Your data is stored locally in your browser and is not transmitted to
            us. See our{" "}
            <a
              href="/privacy"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Privacy Policy
            </a>{" "}
            for full details on how your data is handled.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">7. No Warranty</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind, either express or implied. We do not warrant that:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>The Service will be uninterrupted or error-free.</li>
            <li>
              AI-generated classifications or extractions will be accurate.
            </li>
            <li>The Service will meet your specific requirements.</li>
          </ul>
          <p>
            You should not rely on AI-generated financial data for tax,
            accounting, or legal purposes without independent verification.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">
            8. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, {siteConfig.name} and its
            contributors shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, or any loss of data,
            profits, or revenue, whether incurred directly or indirectly,
            arising from your use of the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">9. Open Source License</h2>
          <p>
            The source code for {siteConfig.name} is available under an open
            source license on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              GitHub
            </a>
            . Your use of the source code is governed by the applicable open
            source license in the repository.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Changes will be posted
            on this page with an updated date. Continued use of the Service
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">11. Contact</h2>
          <p>
            If you have questions about these terms, you can open an issue on{" "}
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
