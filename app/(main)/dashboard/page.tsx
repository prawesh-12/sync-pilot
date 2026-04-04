import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import SettingsPage from "@/app/(main)/settings/page";
import { getIntegration, getRecentAgentRuns } from "@/lib/db/queries";

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
  const integration = await getIntegration(userId);
  const recentRuns = await getRecentAgentRuns(userId, 10);
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#07070f] text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <section className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">
              Monitor Gmail connection status and recent SyncPilot runs.
            </p>
          </div>
          <Link
            href="/dashboard?settings=open"
            className="rounded-full border border-[#A089E6]/30 px-5 py-1.5 text-sm text-[#A089E6] transition-colors hover:bg-[#A089E6]/10"
          >
            Connection Setting
          </Link>
        </section>

        {gmailStatus === "connected" ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Gmail connected successfully.
          </div>
        ) : null}
        {gmailStatus === "failed" ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Gmail connection failed. Check your Google OAuth settings and try again.
            {gmailError ? ` Reason: ${gmailError}` : ""}
          </div>
        ) : null}

        <section className="space-y-6">
          <div className="rounded-2xl border border-[#A089E6]/15 bg-white/4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">Integration</h2>
              </div>
              <span
                className={
                  isConnected
                    ? "rounded-lg border border-[#A089E6]/30 bg-[#A089E6]/15 px-4 py-1 text-sm text-[#A089E6]"
                    : "rounded-lg border border-white/10 bg-white/3 px-4 py-1 text-sm text-gray-400"
                }
              >
                {isConnected ? "Connected" : "Not connected"}
              </span>
            </div>

            {isConnected ? (
              <p className="mt-3 text-sm text-gray-400">
                Your Google account is linked. Cron jobs can now fetch unread emails.
              </p>
            ) : (
              <p className="mt-3 text-sm text-gray-400">
                Connect your Google account to start the email summary pipeline.
              </p>
            )}
          </div>

          <div className="mx-auto w-full max-w-md rounded-2xl border border-[#A089E6]/15 bg-white/4 p-6">
            <h2 className="text-lg font-semibold text-white">Last 10 Runs</h2>
            <p className="mt-1 text-sm text-gray-400">Most recent agent executions.</p>

            {recentRuns.length ? (
              <div className="mt-4">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="mb-2 rounded-xl border border-[#A089E6]/10 bg-white/3 px-3 py-2 last:mb-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
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
                    <p className="mt-0.5 text-xs text-gray-500">
                      Emails found: {run.emailsFound} • Summaries sent: {run.summariesSent}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-gray-600">
                No agent runs yet.
              </p>
            )}
          </div>
        </section>
      </div>

      {isSettingsOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="relative h-auto max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#A089E6]/20 bg-[#07070f] shadow-2xl">
            <Link
              href="/dashboard"
              className="absolute right-4 top-4 z-10 rounded-full border border-[#A089E6]/30 bg-[#07070f]/90 px-4 py-1.5 text-xs text-[#A089E6] transition-colors hover:bg-[#A089E6]/10"
            >
              Close
            </Link>
            <SettingsPage
              searchParams={
                Promise.resolve({
                  gmail: params.gmail,
                  signal: params.signal,
                  signalError: params.signalError,
                })
              }
              variant="popup"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
