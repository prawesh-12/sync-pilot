import { countDecisions, getDecisionsPage } from "@/db/queries";
import { DecisionsPagination } from "@/components/agent/decisions-pagination";
import { getDecisionBadgeClass, getDecisionLabel } from "@/lib/decisions";
import { formatRelativeTime } from "@/lib/format";

type AgentDecisionsListProps = {
  userId: string;
  page: number;
};

type DecisionRow = Awaited<ReturnType<typeof getDecisionsPage>>[number];

// Roughly one viewport of rows, so the list never scrolls past the pager.
export const DECISIONS_PER_PAGE = 10;

const FIRST_PAGE = 1;

export async function AgentDecisionsList({
  userId,
  page,
}: AgentDecisionsListProps) {
  const total = await countDecisions(userId);

  if (total === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-sp-muted">
        No agent decisions yet.
      </p>
    );
  }

  const totalPages = Math.ceil(total / DECISIONS_PER_PAGE);
  const currentPage = Math.min(Math.max(page, FIRST_PAGE), totalPages);
  const decisions = await getDecisionsPage(
    userId,
    currentPage,
    DECISIONS_PER_PAGE,
  );

  return (
    <div className="flex flex-col">
      <ul className="flex flex-col gap-2">
        {decisions.map((decision) => (
          <DecisionRow key={decision.id} decision={decision} />
        ))}
      </ul>

      <p className="mt-3 text-center text-xs text-sp-muted">
        Page {currentPage} of {totalPages} &middot; {total} decisions
      </p>

      <DecisionsPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

function DecisionRow({ decision }: { decision: DecisionRow }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-sp-text">
          {decision.subject || "(No subject)"}
        </p>
        <p className="text-xs text-sp-muted">{decision.reasoning}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={getBadgeClass(decision.decision)}>
          {getDecisionLabel(decision.decision)}
        </span>
        <span className="text-xs text-sp-muted">
          {formatRelativeTime(decision.createdAt)}
        </span>
      </div>
    </li>
  );
}

function getBadgeClass(decision: DecisionRow["decision"]) {
  return `rounded-full border px-2.5 py-0.5 text-xs ${getDecisionBadgeClass(decision)}`;
}
