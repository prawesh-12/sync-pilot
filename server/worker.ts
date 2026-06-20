import { Worker, type Job } from "bullmq";
import { runAgent } from "./agent";
import { redisConnection, SYNC_QUEUE_NAME, type SyncJob } from "./queue";
import { reportJobStatus, type SyncJobStatus } from "./report-status";
import { scopedLogger } from "./logger";

// Process this many Gmail accounts at the same time, per the plan's target.
const WORKER_CONCURRENCY = 10;

const log = scopedLogger("WORKER");

// Consumes one sync job and runs the agent for that integration.
export function processJob(job: SyncJob): Promise<void> {
  return runAgent(job);
}

function startWorker() {
  const worker = new Worker<SyncJob>(
    SYNC_QUEUE_NAME,
    (job: Job<SyncJob>) => processJob(job.data),
    {
      connection: redisConnection,
      concurrency: WORKER_CONCURRENCY,
    },
  );

  worker.on("active", (job) => {
    void report(job, "active");
  });

  worker.on("completed", (job) => {
    log.info(
      { jobId: job.id, integrationId: job.data.integrationId },
      "job completed",
    );
    void report(job, "completed");
  });

  worker.on("failed", (job, error) => {
    log.error(
      { jobId: job?.id, integrationId: job?.data.integrationId, err: error.message },
      "job failed",
    );

    if (job) {
      // BullMQ fires "failed" on every attempt; the job is truly dead once it
      // has used its final attempt.
      const isDead = job.attemptsMade >= (job.opts.attempts ?? 1);
      void report(job, isDead ? "dead" : "failed", error.message);
    }
  });

  registerShutdown(worker);
}

function report(job: Job<SyncJob>, status: SyncJobStatus, error?: string) {
  return reportJobStatus({
    bullJobId: String(job.id),
    userId: job.data.userId,
    integrationId: job.data.integrationId,
    status,
    attempts: job.attemptsMade,
    error,
  });
}

// Let BullMQ finish in-flight jobs before the container stops.
function registerShutdown(worker: Worker<SyncJob>) {
  const shutdown = async () => {
    await worker.close();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startWorker();
