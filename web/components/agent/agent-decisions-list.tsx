import { getRecentDecisions } from "@/db/queries";
import { decisionBadgeClass, decisionLabel } from "@/lib/decisions";
import { formatRelativeTime } from "@/lib/format";

type AgentDecisionsListProps = {
  userId: string;
};

type DecisionRow = Awaited<ReturnType<typeof getRecentDecisions>>[number];

const RECENT_DECISIONS_LIMIT = 50;

export async function AgentDecisionsList({ userId }: AgentDecisionsListProps) {
  const decisions = await getRecentDecisions(userId, RECENT_DECISIONS_LIMIT);

  if (decisions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-gray-600">
        No agent decisions yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {decisions.map((decision) => (
        <DecisionRow key={decision.id} decision={decision} />
      ))}
    </ul>
  );
}

function DecisionRow({ decision }: { decision: DecisionRow }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-[#A089E6]/10 bg-white/3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-white">
          {decision.subject || "(No subject)"}
        </p>
        <p className="text-xs text-gray-500">{decision.reasoning}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={badgeClass(decision.decision)}>
          {decisionLabel(decision.decision)}
        </span>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(decision.createdAt)}
        </span>
      </div>
    </li>
  );
}

function badgeClass(decision: DecisionRow["decision"]) {
  return `rounded-full border px-2.5 py-0.5 text-xs ${decisionBadgeClass(decision)}`;
}
