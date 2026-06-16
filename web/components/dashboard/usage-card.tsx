import { getMonthlyUsage, getRecentAgentRuns, getUserPlan } from "@/db/queries";
import { getUsageMonth } from "@/features/agent/usage";
import { FREE_MONTHLY_TOKEN_LIMIT } from "@/config/plans";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { Progress } from "@/components/ui/progress";

type UsageCardProps = {
  userId: string;
};

const FULL_PERCENT = 100;

export async function UsageCard({ userId }: UsageCardProps) {
  const month = getUsageMonth(new Date());
  const [plan, usage, recentRuns] = await Promise.all([
    getUserPlan(userId),
    getMonthlyUsage(userId, month),
    getRecentAgentRuns(userId, 1),
  ]);

  const isPro = plan === "pro";
  const lastRun = recentRuns[0]?.ranAt ?? null;
  const usedPercent = Math.min(
    FULL_PERCENT,
    Math.round(
      (usage.totalTokensUsed / FREE_MONTHLY_TOKEN_LIMIT) * FULL_PERCENT,
    ),
  );

  return (
    <div className="shrink-0 flex flex-col gap-3 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">Usage</h2>
        <span className="text-xs text-gray-400">This month</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-gray-400">Tokens</span>
          <span className="font-medium text-white">
            {formatNumber(usage.totalTokensUsed)}
            {isPro
              ? " · Unlimited"
              : ` / ${formatNumber(FREE_MONTHLY_TOKEN_LIMIT)}`}
          </span>
        </div>
        {isPro ? null : (
          <Progress value={usedPercent} className="bg-[#A089E6]/15" />
        )}
      </div>

      <div className="flex flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:items-center sm:gap-4">
        <span>
          Emails processed:{" "}
          <span className="text-gray-200">{formatNumber(usage.emailCount)}</span>
        </span>
        <span className="hidden text-gray-600 sm:inline">•</span>
        <span>
          Last run:{" "}
          <span className="text-gray-200">
            {lastRun ? formatRelativeTime(lastRun) : "Never"}
          </span>
        </span>
      </div>
    </div>
  );
}
