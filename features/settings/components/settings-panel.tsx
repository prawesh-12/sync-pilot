import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isSignalConfigured } from "@/config/env";
import {
  disconnectGmailIntegration,
  disconnectSignalIntegration,
  getIntegration,
  getSignalIntegration,
  upsertSignalIntegration,
  upsertUser,
} from "@/db/queries";
import { buildSignalDeviceName } from "@/features/signal/signal";
import { EmailIntegrationCard } from "@/features/settings/components/email-card";
import { SignalIntegrationCard } from "@/features/settings/components/signal-card";

const PHONE_NUMBER_PATTERN = /^\+\d{8,15}$/;

export type SettingsSearchParams = {
  gmail?: string | string[];
  signal?: string | string[];
  signalError?: string | string[];
};

type SettingsPanelVariant = "page" | "popup";
type GmailIntegration = Awaited<ReturnType<typeof getIntegration>>;

type SettingsPanelProps = {
  userId: string;
  searchParams: SettingsSearchParams;
  variant?: SettingsPanelVariant;
  integration?: GmailIntegration;
};

export async function SettingsPanel({
  userId,
  searchParams,
  variant = "page",
  integration,
}: SettingsPanelProps) {
  const gmailStatus = Array.isArray(searchParams.gmail)
    ? searchParams.gmail[0]
    : searchParams.gmail;
  const signalStatus = Array.isArray(searchParams.signal)
    ? searchParams.signal[0]
    : searchParams.signal;
  const signalError = Array.isArray(searchParams.signalError)
    ? searchParams.signalError[0]
    : searchParams.signalError;
  const integrationPromise =
    integration === undefined ? getIntegration(userId) : Promise.resolve(integration);
  const [resolvedIntegration, signalIntegration] = await Promise.all([
    integrationPromise,
    getSignalIntegration(userId),
  ]);
  const isConnected = Boolean(resolvedIntegration);
  const isSignalConnected = Boolean(signalIntegration);
  const isSignalServiceConfigured = isSignalConfigured();
  const signalDeviceName =
    signalIntegration?.deviceName || buildSignalDeviceName(userId);
  const senderNumber = signalIntegration?.senderNumber || "";
  const recipientNumber = signalIntegration?.recipientNumber || "";

  async function disconnectGoogleAction() {
    "use server";

    const { userId: actionUserId } = await auth();

    if (!actionUserId) {
      redirect("/sign-in");
    }

    await disconnectGmailIntegration(actionUserId);
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    if (variant === "popup") {
      redirect("/dashboard?settings=open&gmail=disconnected");
    }

    redirect("/settings?gmail=disconnected");
  }

  async function saveSignalIntegrationAction(formData: FormData) {
    "use server";

    const { userId: actionUserId } = await auth();

    if (!actionUserId) {
      redirect("/sign-in");
    }

    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses[0]?.emailAddress;

    if (!email) {
      redirect(buildSignalSettingsUrl(variant, "failed", "Missing Clerk email."));
    }

    const senderNumberValue = normalizePhoneNumber(
      formData.get("senderNumber"),
    );
    const recipientNumberValue = normalizePhoneNumber(
      formData.get("recipientNumber"),
    );

    if (!isValidPhoneNumber(senderNumberValue)) {
      redirect(
        buildSignalSettingsUrl(
          variant,
          "failed",
          "Sender number must be in E.164 format (example: +14155550123).",
        ),
      );
    }

    if (!isValidPhoneNumber(recipientNumberValue)) {
      redirect(
        buildSignalSettingsUrl(
          variant,
          "failed",
          "Recipient number must be in E.164 format (example: +14155550123).",
        ),
      );
    }

    await upsertUser({ id: actionUserId, email });
    await upsertSignalIntegration(actionUserId, {
      deviceName: signalDeviceName,
      senderNumber: senderNumberValue,
      recipientNumber: recipientNumberValue,
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    redirect(buildSignalSettingsUrl(variant, "saved"));
  }

  async function disconnectSignalAction() {
    "use server";

    const { userId: actionUserId } = await auth();

    if (!actionUserId) {
      redirect("/sign-in");
    }

    await disconnectSignalIntegration(actionUserId);
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    redirect(buildSignalSettingsUrl(variant, "disconnected"));
  }

  const disconnectedBanner =
    gmailStatus === "disconnected" ? (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        Gmail integration disconnected.
      </div>
    ) : null;

  const signalSavedBanner =
    signalStatus === "saved" ? (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        Signal integration saved.
      </div>
    ) : null;

  const signalDisconnectedBanner =
    signalStatus === "disconnected" ? (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        Signal integration disconnected.
      </div>
    ) : null;

  const signalFailedBanner =
    signalStatus === "failed" ? (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Failed to save Signal integration.
        {signalError ? ` ${signalError}` : ""}
      </div>
    ) : null;

  const emailSection = (
    <section className="space-y-2">
      <EmailIntegrationCard
        isConnected={isConnected}
        integration={resolvedIntegration}
        disconnectAction={disconnectGoogleAction}
      />
    </section>
  );

  const signalSection = (
    <section className="space-y-2">
      <SignalIntegrationCard
        signalDeviceName={signalDeviceName}
        isSignalConnected={isSignalConnected}
        isSignalServiceConfigured={isSignalServiceConfigured}
        senderNumber={senderNumber}
        recipientNumber={recipientNumber}
        saveAction={saveSignalIntegrationAction}
        disconnectAction={disconnectSignalAction}
      />
    </section>
  );

  if (variant === "popup") {
    return (
      <div className="mx-auto flex max-h-[90dvh] w-full flex-col gap-6 overflow-y-auto px-4 pt-10 pb-10 sm:max-h-none sm:max-w-4xl sm:overflow-visible sm:px-6 sm:py-10">
        {disconnectedBanner}
        {signalSavedBanner}
        {signalDisconnectedBanner}
        {signalFailedBanner}
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
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </section>

      {disconnectedBanner}
      {signalSavedBanner}
      {signalDisconnectedBanner}
      {signalFailedBanner}
      {emailSection}
      {signalSection}
    </main>
  );
}

function normalizePhoneNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, "");
}

function isValidPhoneNumber(value: string) {
  return PHONE_NUMBER_PATTERN.test(value);
}

function buildSignalSettingsUrl(
  variant: SettingsPanelVariant,
  signalStatus: "saved" | "failed" | "disconnected",
  signalError?: string,
) {
  const basePath = variant === "popup" ? "/dashboard?settings=open" : "/settings";
  const querySeparator = basePath.includes("?") ? "&" : "?";
  let url = `${basePath}${querySeparator}signal=${signalStatus}`;

  if (signalError) {
    url += `&signalError=${encodeURIComponent(signalError)}`;
  }

  return url;
}
