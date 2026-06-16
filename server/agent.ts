import type { SyncJob } from "./queue";

// Runs the Gmail -> summarise -> Signal pipeline for one integration.
// Full logic will move here from the web app later.
export async function runAgent(job: SyncJob): Promise<void> {
  throw new Error(
    `runAgent is not implemented yet (job for integration ${job.integrationId})`,
  );
}
