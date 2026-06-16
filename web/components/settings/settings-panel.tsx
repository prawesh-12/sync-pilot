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
  signal?: string | string[];
  signalError?: string | string[];
};

type SettingsPanelVariant = "page" | "popup";

type SettingsPanelProps = {
  userId: string;
  searchParams: SettingsSearchParams;
  variant?: SettingsPanelVariant;
};

export async function SettingsPanel({
  userId,
  searchParams,
  variant = "page",
}: SettingsPanelProps) {
  const gmailStatus = firstValue(searchParams.gmail);
  const signalStatus = firstValue(searchParams.signal);
  const signalError = firstValue(searchParams.signalError);

  const [gmailAccounts, signalIntegration] = await Promise.all([
    getGmailAccounts(userId),
    getSignalIntegration(userId),
  ]);

  const isSignalConnected = Boolean(signalIntegration);
  const signalDeviceName =
    signalIntegration?.deviceName || buildSignalDeviceName(userId);
  const returnTo =
    variant === "popup" ? "/dashboard?settings=open" : "/settings";

  const banners = (
    <SettingsBanners
      gmailStatus={gmailStatus}
      signalStatus={signalStatus}
      signalError={signalError}
    />
  );

  const emailSection = (
    <section className="space-y-2">
      <GmailAccountsCard
        accounts={gmailAccounts}
        variant={variant}
        returnTo={returnTo}
        toggleAction={toggleGmailAccountAction}
        removeAction={removeGmailAccountAction}
      />
    </section>
  );

  const signalSection = (
    <section className="space-y-2">
      <SignalIntegrationCard
        variant={variant}
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

  if (variant === "popup") {
    return (
      <div className="mx-auto flex max-h-[90dvh] w-full flex-col gap-6 overflow-y-auto px-4 pt-10 pb-10 sm:max-h-none sm:max-w-4xl sm:overflow-visible sm:px-6 sm:py-10">
        {banners}
        {emailSection}
        {signalSection}
      </div>
    );
  }

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
  signalStatus,
  signalError,
}: {
  gmailStatus?: string;
  signalStatus?: string;
  signalError?: string;
}) {
  return (
    <>
      {gmailStatus === "disconnected" ? (
        <Banner tone="warning">Gmail account removed.</Banner>
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
