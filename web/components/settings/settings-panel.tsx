import { PendingLink } from "@/components/pending-link";
import { Button } from "@/components/ui/button";
import { ctaButtonTheme } from "@/components/cta-button-class";
import { isSignalConfigured } from "@/config/env";
import { getGmailAccounts, getSignalIntegration } from "@/db/queries";
import { buildSignalDeviceName } from "@/features/signal/signal";
import { GmailAccountsCard } from "@/components/settings/gmail-accounts-card";
import { SignalIntegrationCard } from "@/components/settings/signal-card";
import {
  disconnectSignalAction,
  removeGmailAccountAction,
  saveSignalIntegrationAction,
  toggleGmailAccountAction,
} from "@/components/settings/settings-actions";

export type SettingsSearchParams = {
  gmail?: string | string[];
  gmailError?: string | string[];
  signal?: string | string[];
  signalError?: string | string[];
};

type SettingsPanelProps = {
  userId: string;
  searchParams: SettingsSearchParams;
};

export async function SettingsPanel({
  userId,
  searchParams,
}: SettingsPanelProps) {
  const gmailStatus = firstValue(searchParams.gmail);
  const gmailError = firstValue(searchParams.gmailError);
  const signalStatus = firstValue(searchParams.signal);
  const signalError = firstValue(searchParams.signalError);

  const [gmailAccounts, signalIntegration] = await Promise.all([
    getGmailAccounts(userId),
    getSignalIntegration(userId),
  ]);

  const isSignalConnected = Boolean(signalIntegration);
  const signalDeviceName =
    signalIntegration?.deviceName || buildSignalDeviceName(userId);

  const banners = (
    <SettingsBanners
      gmailStatus={gmailStatus}
      gmailError={gmailError}
      signalStatus={signalStatus}
      signalError={signalError}
    />
  );

  const emailSection = (
    <section className="space-y-2">
      <GmailAccountsCard
        accounts={gmailAccounts}
        returnTo="/settings"
        toggleAction={toggleGmailAccountAction}
        removeAction={removeGmailAccountAction}
      />
    </section>
  );

  const signalSection = (
    <section className="space-y-2">
      <SignalIntegrationCard
        signalDeviceName={signalDeviceName}
        isSignalConnected={isSignalConnected}
        isSignalServiceConfigured={isSignalConfigured()}
        senderNumber={signalIntegration?.senderNumber || ""}
        recipientNumber={signalIntegration?.recipientNumber || ""}
        saveAction={saveSignalIntegrationAction}
        disconnectAction={disconnectSignalAction}
      />
    </section>
  );

  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage connected integrations.
          </p>
        </div>
        <Button asChild className={ctaButtonTheme}>
          <PendingLink href="/dashboard">Back to dashboard</PendingLink>
        </Button>
      </section>

      {banners}
      {emailSection}
      {signalSection}
    </main>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function SettingsBanners({
  gmailStatus,
  gmailError,
  signalStatus,
  signalError,
}: {
  gmailStatus?: string;
  gmailError?: string;
  signalStatus?: string;
  signalError?: string;
}) {
  return (
    <>
      {gmailStatus === "connected" ? (
        <Banner tone="success">Gmail connected successfully.</Banner>
      ) : null}
      {gmailStatus === "disconnected" ? (
        <Banner tone="warning">Gmail account removed.</Banner>
      ) : null}
      {gmailStatus === "failed" ? (
        <Banner tone="error">
          Gmail connection failed.
          {gmailError ? ` ${gmailError}` : ""}
        </Banner>
      ) : null}
      {signalStatus === "saved" ? (
        <Banner tone="success">Signal integration saved.</Banner>
      ) : null}
      {signalStatus === "disconnected" ? (
        <Banner tone="warning">Signal integration disconnected.</Banner>
      ) : null}
      {signalStatus === "failed" ? (
        <Banner tone="error">
          Failed to save Signal integration.
          {signalError ? ` ${signalError}` : ""}
        </Banner>
      ) : null}
    </>
  );
}

const BANNER_TONES = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  error: "border-red-500/30 bg-red-500/10 text-red-200",
} as const;

function Banner({
  tone,
  children,
}: {
  tone: keyof typeof BANNER_TONES;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${BANNER_TONES[tone]}`}
    >
      {children}
    </div>
  );
}
