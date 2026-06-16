import { runAgent } from "./agent";
import type { SyncJob } from "./queue";

// Consumes one sync job and runs the agent; the BullMQ Worker wiring
// (Redis connection + concurrency) is not implemented yet.
export async function processJob(job: SyncJob): Promise<void> {
  await runAgent(job);
}
