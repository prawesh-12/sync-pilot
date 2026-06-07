import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — SyncPilot",
  description:
    "How SyncPilot collects, uses, and protects your data when connecting Gmail and Signal.",
};

const LAST_UPDATED = "June 7, 2026";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p>
        SyncPilot AI (&quot;SyncPilot,&quot; &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;) operates an AI-powered service that reads your Gmail
        inbox, summarizes new messages, and delivers those summaries to Signal.
        This Privacy Policy explains what information we collect, how we use it,
        and the choices you have.
      </p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>When you use SyncPilot, we may collect the following:</p>
        <ul>
          <li>
            <strong>Account information:</strong> Your email address and user
            identifier provided through Clerk when you sign up or sign in.
          </li>
          <li>
            <strong>Gmail integration data:</strong> OAuth access and refresh
            tokens for Gmail (stored encrypted), and the timestamp of your last
            email sync. We request read-only access to Gmail (
            <code>gmail.readonly</code>).
          </li>
          <li>
            <strong>Signal configuration:</strong> Device name, sender phone
            number, and recipient phone number you provide to deliver summaries.
          </li>
          <li>
            <strong>Run metadata:</strong> Counts of emails found and summaries
            sent, run status, and timestamps. We do not store full email bodies
            in our database.
          </li>
          <li>
            <strong>Manual agent requests:</strong> Task descriptions and context
            you submit in the Agent Console are processed in real time and are
            not persisted in our database.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Email Content Processing</h2>
        <p>
          To provide summaries, SyncPilot temporarily accesses email subject
          lines, sender addresses, and message bodies from your Gmail account.
          This content is:
        </p>
        <ul>
          <li>Sent to Groq&apos;s AI models to generate summaries</li>
          <li>Delivered to your configured Signal recipient number</li>
          <li>Not stored as full message content in our PostgreSQL database</li>
        </ul>
        <p>
          Email content exists only for the duration needed to complete each
          processing run.
        </p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Authenticate you and maintain your account</li>
          <li>Connect and manage your Gmail and Signal integrations</li>
          <li>Fetch new emails and generate AI summaries on a schedule</li>
          <li>Send summaries to your Signal number</li>
          <li>Display connection status and run history in your dashboard</li>
          <li>Respond to manual agent requests you initiate</li>
          <li>Improve reliability, security, and service operation</li>
        </ul>
      </section>

      <section>
        <h2>4. Third-Party Services</h2>
        <p>
          SyncPilot relies on third-party providers to operate. Data may be
          shared with:
        </p>
        <ul>
          <li>
            <strong>Clerk</strong> — authentication and session management
          </li>
          <li>
            <strong>Google (Gmail API)</strong> — read-only access to your inbox
            via OAuth
          </li>
          <li>
            <strong>Groq</strong> — AI summarization of email content and agent
            prompts
          </li>
          <li>
            <strong>Signal (via signal-cli-rest-api)</strong> — delivery of
            generated summaries
          </li>
          <li>
            <strong>PostgreSQL hosting provider</strong> — encrypted storage of
            account and integration data
          </li>
        </ul>
        <p>
          Each provider processes data under its own privacy policy. We encourage
          you to review their terms before connecting integrations.
        </p>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <ul>
          <li>
            Account and integration records are kept while your account is active
            or as needed to provide the service.
          </li>
          <li>
            Gmail OAuth tokens are deleted when you disconnect Gmail in Settings.
          </li>
          <li>
            Signal configuration is deleted when you disconnect Signal in
            Settings.
          </li>
          <li>
            Agent run metadata (counts and status) is retained to show history in
            your dashboard.
          </li>
          <li>
            Email content processed for summarization is not retained after each
            run completes.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Security</h2>
        <p>We take reasonable measures to protect your data, including:</p>
        <ul>
          <li>
            Encrypting Gmail OAuth tokens at rest using AES-256-GCM
          </li>
          <li>Requiring authentication for access to protected routes and APIs</li>
          <li>Protecting scheduled processing endpoints with a secret bearer token</li>
          <li>Validating OAuth state parameters during Google authorization</li>
        </ul>
        <p>
          No method of transmission or storage is completely secure. We cannot
          guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>7. Your Choices and Rights</h2>
        <p>You can:</p>
        <ul>
          <li>Disconnect Gmail or Signal at any time from Settings</li>
          <li>Manage your account through Clerk&apos;s account controls</li>
          <li>Stop using the service by disconnecting integrations and signing out</li>
        </ul>
        <p>
          Depending on your location, you may have additional rights to access,
          correct, or delete personal data. Contact us using the information
          below to make a request.
        </p>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>
          SyncPilot uses session cookies provided by Clerk to keep you signed in.
          We do not use third-party advertising or analytics tracking cookies.
        </p>
      </section>

      <section>
        <h2>9. Children&apos;s Privacy</h2>
        <p>
          SyncPilot is not intended for users under 13 years of age. We do not
          knowingly collect personal information from children.
        </p>
      </section>

      <section>
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last
          updated&quot; date at the top of this page will reflect the latest
          revision. Continued use of SyncPilot after changes constitutes
          acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          For privacy-related questions or requests, contact us through the{" "}
          <a
            href="https://github.com/prawesh-12/sync-pilot/issues"
            className="text-[#A089E6] underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SyncPilot GitHub repository
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
