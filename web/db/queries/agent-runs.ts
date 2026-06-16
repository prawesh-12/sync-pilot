import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { agentRuns, type RunStatusValue } from "@/db/schema";

const DEFAULT_RUN_LIMIT = 10;
const MIN_RUN_LIMIT = 1;
const MAX_RUN_LIMIT = 50;

type AgentRunResult = {
  emailsFound: number;
  summariesSent: number;
  status: RunStatusValue;
};

export const getRecentAgentRuns = cache(async function getRecentAgentRuns(
  userId: string,
  limit = DEFAULT_RUN_LIMIT,
) {
  const db = getDb();
  const safeLimit = Math.min(Math.max(limit, MIN_RUN_LIMIT), MAX_RUN_LIMIT);

  return db
    .select({
      id: agentRuns.id,
      ranAt: agentRuns.ranAt,
      emailsFound: agentRuns.emailsFound,
      summariesSent: agentRuns.summariesSent,
      status: agentRuns.status,
    })
    .from(agentRuns)
    .where(eq(agentRuns.userId, userId))
    .orderBy(desc(agentRuns.ranAt))
    .limit(safeLimit);
});

export async function saveAgentRun(userId: string, result: AgentRunResult) {
  const db = getDb();
  const [agentRun] = await db
    .insert(agentRuns)
    .values({
      userId,
      emailsFound: result.emailsFound,
      summariesSent: result.summariesSent,
      status: result.status,
    })
    .returning();

  return agentRun;
}
