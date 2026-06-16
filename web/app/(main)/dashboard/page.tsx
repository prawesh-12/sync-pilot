import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from "react";
import { DashboardSettingsModal } from "@/components/dashboard/dashboard-settings-modal";
import { SettingsPopupSkeleton } from "@/components/dashboard/settings-popup-skeleton";
import { DashboardIntegrationStatus } from "@/components/dashboard/dashboard-integration-status";
import { DashboardRecentRuns } from "@/components/dashboard/dashboard-recent-runs";
import {
  IntegrationStatusSkeleton,
  RecentRunsSkeleton,
} from "@/components/dashboard/dashboard-section-skeletons";
import { SettingsPanel } from "@/components/settings/settings-panel";

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

  const gmailStatus = Array.isArray(params.gmail) ? params.gmail[0] : params.gmail;
  const gmailError = Array.isArray(params.gmailError)
    ? params.gmailError[0]
    : params.gmailError;
  const settingsParam = Array.isArray(params.settings)
    ? params.settings[0]
    : params.settings;
  const isSettingsOpen = settingsParam === "open";

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
          <DashboardSettingsModal isOpen={isSettingsOpen}>
            {isSettingsOpen ? (
              <Suspense fallback={<SettingsPopupSkeleton />}>
                <SettingsPanel
                  userId={userId}
                  searchParams={{
                    gmail: params.gmail,
                    signal: params.signal,
                    signalError: params.signalError,
                  }}
                  variant="popup"
                />
              </Suspense>
            ) : null}
          </DashboardSettingsModal>
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

          <Suspense fallback={<RecentRunsSkeleton />}>
            <DashboardRecentRuns userId={userId} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
