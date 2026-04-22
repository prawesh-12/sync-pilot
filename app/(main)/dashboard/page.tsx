import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardSettingsModal } from "@/components/dashboard/dashboard-settings-modal";
import { SettingsPopupSkeleton } from "@/components/dashboard/settings-popup-skeleton";
import { getIntegration, getRecentAgentRuns } from "@/db/queries";
import { SettingsPanel } from "@/features/settings/components/settings-panel";

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
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const [integration, recentRuns] = await Promise.all([
    getIntegration(userId),
    getRecentAgentRuns(userId, 10),
  ]);
  const isConnected = Boolean(integration);
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
                  integration={integration}
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
          <div className="shrink-0 flex flex-col gap-2 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Integration</h2>
              {isConnected ? (
                <p className="mt-0.5 text-xs text-gray-400">
                  Your Google account is linked. Cron jobs can now fetch unread emails.
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-gray-400">
                  Connect your Google account to start the email summary pipeline.
                </p>
              )}
            </div>
            <span
              className={
                isConnected
                  ? "self-start shrink-0 rounded-lg border border-[#A089E6]/30 bg-[#A089E6]/15 px-3 py-1 text-xs text-[#A089E6] sm:self-auto"
                  : "self-start shrink-0 rounded-lg border border-white/10 bg-white/3 px-3 py-1 text-xs text-gray-400 sm:self-auto"
              }
            >
              {isConnected ? "Connected" : "Not connected"}
            </span>
          </div>

          <div className="flex flex-col w-full rounded-2xl border border-[#A089E6]/15 bg-white/4 p-4">
            <div className="shrink-0">
              <h2 className="text-lg font-semibold text-white">Last 10 Runs</h2>
              <p className="mt-0.5 text-xs text-gray-400">Most recent agent executions.</p>
            </div>

            {recentRuns.length ? (
              <div className="mt-4 grid grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:overflow-y-auto sm:pb-2 sm:pr-2">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="rounded-xl border border-[#A089E6]/10 bg-white/3 px-3 py-2"
                  >
                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                      <p className="text-sm font-medium text-white">
                        {new Date(run.ranAt).toLocaleString()}
                      </p>
                      <span
                        className={
                          run.status === "success"
                            ? "rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-400"
                            : "rounded-full border border-red-500/20 bg-red-500/15 px-2.5 py-0.5 text-xs text-red-400"
                        }
                      >
                        {run.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 sm:hidden">
                      Emails found: {run.emailsFound}
                    </p>
                    <p className="text-xs text-gray-500 sm:hidden">
                      Summaries sent: {run.summariesSent}
                    </p>
                    <p className="mt-0.5 hidden text-xs text-gray-500 sm:block">
                      Emails found: {run.emailsFound} • Summaries sent: {run.summariesSent}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 shrink-0 rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-gray-600">
                No agent runs yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
