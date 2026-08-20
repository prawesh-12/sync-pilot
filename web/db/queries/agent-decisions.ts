import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { agentDecisions, type DecisionValue } from "@/db/schema";

const DEFAULT_DECISION_LIMIT = 50;
const MIN_DECISION_LIMIT = 1;
const MAX_DECISION_LIMIT = 200;
const FIRST_PAGE = 1;

type AgentDecisionInput = {
  runId: string;
  userId: string;
  gmailMessageId: string;
  subject: string | null;
  decision: DecisionValue;
  reasoning: string;
  toolCalls: unknown;
};

export async function saveAgentDecisions(decisions: AgentDecisionInput[]) {
  if (decisions.length === 0) {
    return [];
  }

  const db = getDb();

  return db
    .insert(agentDecisions)
    .values(decisions)
    .returning({ id: agentDecisions.id });
}

export async function getDecisionsForRun(runId: string) {
  const db = getDb();

  return db
    .select({
      id: agentDecisions.id,
      gmailMessageId: agentDecisions.gmailMessageId,
      decision: agentDecisions.decision,
      reasoning: agentDecisions.reasoning,
      createdAt: agentDecisions.createdAt,
    })
    .from(agentDecisions)
    .where(eq(agentDecisions.runId, runId))
    .orderBy(asc(agentDecisions.createdAt));
}

// One page of decisions for the audit view; newest first.
export async function getDecisionsPage(
  userId: string,
  page: number,
  pageSize = DEFAULT_DECISION_LIMIT,
) {
  const db = getDb();
  const safeSize = Math.min(
    Math.max(pageSize, MIN_DECISION_LIMIT),
    MAX_DECISION_LIMIT,
  );
  const safePage = Math.max(page, FIRST_PAGE);

  return db
    .select({
      id: agentDecisions.id,
      subject: agentDecisions.subject,
      decision: agentDecisions.decision,
      reasoning: agentDecisions.reasoning,
      createdAt: agentDecisions.createdAt,
    })
    .from(agentDecisions)
    .where(eq(agentDecisions.userId, userId))
    // id breaks ties: bulk inserts share a timestamp, and without a total
    // order the same row can land on two pages while another is skipped.
    .orderBy(desc(agentDecisions.createdAt), desc(agentDecisions.id))
    .limit(safeSize)
    .offset((safePage - FIRST_PAGE) * safeSize);
}

export async function countDecisions(userId: string) {
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(agentDecisions)
    .where(eq(agentDecisions.userId, userId));

  return row?.total ?? 0;
}

// Per-run decision counts grouped by decision type, for the run-history breakdown.
export async function getDecisionCountsByRun(runIds: string[]) {
  if (runIds.length === 0) {
    return [];
  }

  const db = getDb();

  return db
    .select({
      runId: agentDecisions.runId,
      decision: agentDecisions.decision,
      count: sql<number>`count(*)::int`,
    })
    .from(agentDecisions)
    .where(inArray(agentDecisions.runId, runIds))
    .groupBy(agentDecisions.runId, agentDecisions.decision);
}
