import { getRecentAgentRuns } from "@/db/queries";

type DashboardRecentRunsProps = {
  userId: string;
};

export async function DashboardRecentRuns({ userId }: DashboardRecentRunsProps) {
  const recentRuns = await getRecentAgentRuns(userId, 10);

  return (
    <div className="flex w-full flex-col rounded-2xl border border-[#A089E6]/15 bg-white/4 p-4">
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
  );
}
