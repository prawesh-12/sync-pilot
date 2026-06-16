import { getDecisionCountsByRun, getRecentAgentRuns } from "@/db/queries";
import { decisionLabel } from "@/lib/decisions";
import { formatNumber } from "@/lib/format";
import type { DecisionValue } from "@/db/schema";

type DashboardRecentRunsProps = {
  userId: string;
};

type RunRow = Awaited<ReturnType<typeof getRecentAgentRuns>>[number];
type DecisionCount = { decision: DecisionValue; count: number };

const RECENT_RUNS_LIMIT = 10;

export async function DashboardRecentRuns({ userId }: DashboardRecentRunsProps) {
  const recentRuns = await getRecentAgentRuns(userId, RECENT_RUNS_LIMIT);
  const countsByRun = await buildCountsByRun(recentRuns.map((run) => run.id));

  return (
    <div className="flex w-full flex-col rounded-2xl border border-[#A089E6]/15 bg-white/4 p-4">
      <div className="shrink-0">
        <h2 className="text-lg font-semibold text-white">Last 10 Runs</h2>
        <p className="mt-0.5 text-xs text-gray-400">Most recent agent executions.</p>
      </div>

      {recentRuns.length ? (
        <div className="mt-4 grid grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:overflow-y-auto sm:pb-2 sm:pr-2">
          {recentRuns.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              decisions={countsByRun.get(run.id) ?? []}
            />
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

async function buildCountsByRun(runIds: string[]) {
  const rows = await getDecisionCountsByRun(runIds);
  const countsByRun = new Map<string, DecisionCount[]>();

  for (const row of rows) {
    const list = countsByRun.get(row.runId) ?? [];
    list.push({ decision: row.decision, count: row.count });
    countsByRun.set(row.runId, list);
  }

  return countsByRun;
}

function RunCard({
  run,
  decisions,
}: {
  run: RunRow;
  decisions: DecisionCount[];
}) {
  return (
    <div className="rounded-xl border border-[#A089E6]/10 bg-white/3 px-3 py-2">
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <p className="text-sm font-medium text-white">
          {new Date(run.ranAt).toLocaleString()}
        </p>
        <span className={statusClass(run.status)}>{run.status}</span>
      </div>
      <p className="mt-0.5 text-xs text-gray-500">
        Emails found: {run.emailsFound} • Summaries sent: {run.summariesSent} •
        Tokens: {formatNumber(run.totalTokens)}
      </p>
      <DecisionBreakdown decisions={decisions} />
    </div>
  );
}

function DecisionBreakdown({ decisions }: { decisions: DecisionCount[] }) {
  if (decisions.length === 0) {
    return null;
  }

  const summary = decisions
    .map((entry) => `${entry.count} ${decisionLabel(entry.decision)}`)
    .join(" · ");

  return <p className="mt-0.5 text-xs text-gray-600">{summary}</p>;
}

function statusClass(status: RunRow["status"]) {
  return status === "success"
    ? "rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-400"
    : "rounded-full border border-red-500/20 bg-red-500/15 px-2.5 py-0.5 text-xs text-red-400";
}
