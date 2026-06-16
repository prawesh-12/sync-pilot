import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  agentFeedback,
  type DecisionValue,
  type FeedbackActionValue,
} from "@/db/schema";

const DEFAULT_FEEDBACK_LIMIT = 20;

type AgentFeedbackInput = {
  userId: string;
  gmailMessageId: string;
  subject: string | null;
  decision: DecisionValue;
  action: FeedbackActionValue;
};

export async function recordAgentFeedback(input: AgentFeedbackInput) {
  const db = getDb();
  const [row] = await db
    .insert(agentFeedback)
    .values(input)
    .returning({ id: agentFeedback.id });

  return row ?? null;
}

// Most recent overrides for a user, newest first; feeds the triage digest.
export async function getRecentFeedback(
  userId: string,
  limit = DEFAULT_FEEDBACK_LIMIT,
) {
  const db = getDb();

  return db
    .select({
      decision: agentFeedback.decision,
      action: agentFeedback.action,
      createdAt: agentFeedback.createdAt,
    })
    .from(agentFeedback)
    .where(eq(agentFeedback.userId, userId))
    .orderBy(desc(agentFeedback.createdAt))
    .limit(limit);
}
