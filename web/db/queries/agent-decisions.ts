import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { agentDecisions, type DecisionValue } from "@/db/schema";

type AgentDecisionInput = {
  runId: string;
  userId: string;
  gmailMessageId: string;
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
