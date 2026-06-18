import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from "react";
import { PendingLink } from "@/components/pending-link";
import { Button } from "@/components/ui/button";
import { ctaButtonTheme } from "@/components/cta-button-class";
import { DashboardIntegrationStatus } from "@/components/dashboard/dashboard-integration-status";
import { BillingCard } from "@/components/dashboard/billing-card";
import { UsageCard } from "@/components/dashboard/usage-card";
import { DashboardRecentRuns } from "@/components/dashboard/dashboard-recent-runs";
import {
  IntegrationStatusSkeleton,
  RecentRunsSkeleton,
  UsageSkeleton,
} from "@/components/dashboard/dashboard-section-skeletons";

type DashboardPageProps = {
  searchParams: Promise<{
    gmail?: string | string[];
    gmailError?: string | string[];
    signal?: string | string[];
    signalError?: string | string[];
    settings?: string | string[];
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  const gmailStatus = firstValue(params.gmail);
  const gmailError = firstValue(params.gmailError);
  const settingsParam = firstValue(params.settings);
  const isSettingsOpen = settingsParam === "open";

  if (isSettingsOpen) {
    redirect(buildSettingsRedirect(params));
  }

  return (
    <main className="relative flex w-full flex-1 flex-col overflow-x-hidden bg-[#07070f] text-white sm:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 flex w-full flex-col px-4 py-4 pb-20 sm:mx-auto sm:h-full sm:max-w-5xl sm:overflow-hidden sm:px-6 sm:pb-4">
        <section className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Monitor Gmail connection status and recent SyncPilot runs.
            </p>
          </div>
          <Button asChild className={ctaButtonTheme}>
            <PendingLink href="/settings">Connection Setting</PendingLink>
          </Button>
        </section>

        {gmailStatus === "connected" ? (
          <div className="shrink-0 mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
            Gmail connected successfully.
          </div>
        ) : null}
        {gmailStatus === "failed" ? (
          <div className="shrink-0 mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            Gmail connection failed. Check your Google OAuth settings and try again.
            {gmailError ? ` Reason: ${gmailError}` : ""}
          </div>
        ) : null}

        <section className="flex flex-col gap-4 sm:flex-1 sm:min-h-0">
          <Suspense fallback={<IntegrationStatusSkeleton />}>
            <DashboardIntegrationStatus userId={userId} />
          </Suspense>

          <Suspense fallback={<UsageSkeleton />}>
            <UsageCard userId={userId} />
          </Suspense>

          <BillingCard userId={userId} />

          <Suspense fallback={<RecentRunsSkeleton />}>
            <DashboardRecentRuns userId={userId} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildSettingsRedirect(
  params: Awaited<DashboardPageProps["searchParams"]>,
) {
  const query = new URLSearchParams();

  appendQueryValue(query, "gmail", firstValue(params.gmail));
  appendQueryValue(query, "gmailError", firstValue(params.gmailError));
  appendQueryValue(query, "signal", firstValue(params.signal));
  appendQueryValue(query, "signalError", firstValue(params.signalError));

  const search = query.toString();

  return search ? `/settings?${search}` : "/settings";
}

function appendQueryValue(
  query: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value) {
    query.set(key, value);
  }
}
