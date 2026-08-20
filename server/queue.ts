import { Queue, type ConnectionOptions } from "bullmq";
import { serverConfig } from "./config";
import { reportJobStatus } from "./report-status";
import { scopedLogger } from "./logger";

export const SYNC_QUEUE_NAME = "email-sync";
const SYNC_JOB_NAME = "sync";

// Retry transient Composio/Signal failures without hammering downstream services.
const JOB_ATTEMPTS = 3;
const JOB_BACKOFF_MS = 5_000;
// Bound queue growth once jobs settle; keep more failures around for debugging.
const COMPLETED_JOBS_KEPT = 100;
const FAILED_JOBS_KEPT = 500;

export type SyncJob = {
  userId: string;
  integrationId: string;
};

// Redis stays local to EC2; host/port come from env and default to localhost.
export const redisConnection: ConnectionOptions = {
  host: serverConfig.redisHost,
  port: serverConfig.redisPort,
};

const log = scopedLogger("QUEUE");

let queue: Queue<SyncJob> | null = null;

export function getEmailQueue(): Queue<SyncJob> {
  if (!queue) {
    queue = new Queue<SyncJob>(SYNC_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: JOB_ATTEMPTS,
        backoff: { type: "exponential", delay: JOB_BACKOFF_MS },
        removeOnComplete: COMPLETED_JOBS_KEPT,
        removeOnFail: FAILED_JOBS_KEPT,
      },
    });

    queue.on("error", (error) => {
      log.error({ err: error, host: serverConfig.redisHost }, "redis error");
    });
  }

  return queue;
}

// Enqueues one BullMQ job per Gmail account so the worker can process them
// concurrently; returns how many were added.
export async function enqueueSyncJobs(jobs: SyncJob[]): Promise<number> {
  if (jobs.length === 0) {
    return 0;
  }

  const emailQueue = getEmailQueue();
  const added = await emailQueue.addBulk(
    jobs.map((job) => ({ name: SYNC_JOB_NAME, data: job })),
  );
  const waiting = await emailQueue.getWaitingCount();

  log.info({ enqueued: added.length, waiting }, "jobs reached redis");

  // Record each job as enqueued so its lifecycle is tracked from the start.
  await Promise.all(
    added.map((job) =>
      reportJobStatus({
        bullJobId: String(job.id),
        userId: job.data.userId,
        integrationId: job.data.integrationId,
        status: "enqueued",
      }),
    ),
  );

  return jobs.length;
}
