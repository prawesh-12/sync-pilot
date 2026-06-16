import { runAgent } from "./agent";
import type { SyncJob } from "./queue";

// Consumes one sync job and runs the agent. The BullMQ Worker wiring
// (Redis connection + concurrency) is added in Phase 3.
export async function processJob(job: SyncJob): Promise<void> {
  await runAgent(job);
}
