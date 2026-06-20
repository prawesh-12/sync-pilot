import { getDb } from "@/db/client";
import { syncJobs, type SyncJobStatusValue } from "@/db/schema";

const MAX_ERROR_LENGTH = 1000;

export type SyncJobEvent = {
  bullJobId: string;
  userId: string;
  integrationId: string;
  status: SyncJobStatusValue;
  attempts?: number;
  error?: string | null;
};

// Upserts a queued job's lifecycle row, keyed by its BullMQ job id. Reported by
// the EC2 worker as the job moves enqueued -> active -> completed/failed/dead.
// Timestamps are derived from the status so callers only send the transition.
export async function recordSyncJobEvent(event: SyncJobEvent): Promise<void> {
  const db = getDb();
  const now = new Date();
  const startedAt = event.status === "active" ? now : undefined;
  const finishedAt = isTerminal(event.status) ? now : undefined;
  const lastError = event.error ? event.error.slice(0, MAX_ERROR_LENGTH) : null;

  await db
    .insert(syncJobs)
    .values({
      bullJobId: event.bullJobId,
      userId: event.userId,
      integrationId: event.integrationId,
      status: event.status,
      attempts: event.attempts ?? 0,
      lastError,
      startedAt,
      finishedAt,
    })
    .onConflictDoUpdate({
      target: syncJobs.bullJobId,
      set: {
        status: event.status,
        attempts: event.attempts ?? 0,
        lastError,
        // Only advance timestamps on the transition that sets them.
        ...(startedAt ? { startedAt } : {}),
        ...(finishedAt ? { finishedAt } : {}),
      },
    });
}

function isTerminal(status: SyncJobStatusValue): boolean {
  return status === "completed" || status === "failed" || status === "dead";
}
