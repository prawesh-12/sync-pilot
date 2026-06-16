import type { SyncJob } from "./queue";

// Runs the Gmail -> summarise -> Signal pipeline for one integration.
// Full logic is moved here from the web app in Phase 3.
export async function runAgent(job: SyncJob): Promise<void> {
  throw new Error(
    `runAgent is implemented in Phase 3 (job for integration ${job.integrationId})`,
  );
}
