import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { agentDecisions, type DecisionValue } from "@/db/schema";

const DEFAULT_DECISION_LIMIT = 50;
const MIN_DECISION_LIMIT = 1;
const MAX_DECISION_LIMIT = 200;

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

// Most recent decisions for the audit view; newest first.
export async function getRecentDecisions(
  userId: string,
  limit = DEFAULT_DECISION_LIMIT,
) {
  const db = getDb();
  const safeLimit = Math.min(
    Math.max(limit, MIN_DECISION_LIMIT),
    MAX_DECISION_LIMIT,
  );

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
    .orderBy(desc(agentDecisions.createdAt))
    .limit(safeLimit);
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
