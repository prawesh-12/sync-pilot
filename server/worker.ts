import { Worker, type Job } from "bullmq";
import { runAgent } from "./agent";
import { redisConnection, SYNC_QUEUE_NAME, type SyncJob } from "./queue";

// Process this many Gmail accounts at the same time, per the plan's target.
const WORKER_CONCURRENCY = 10;

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

  worker.on("completed", (job) => {
    console.log(
      `[WORKER] Completed job ${job.id} for integration ${job.data.integrationId}`,
    );
  });

  worker.on("failed", (job, error) => {
    console.error(`[WORKER] Job ${job?.id} failed: ${error.message}`);
  });

  registerShutdown(worker);
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
