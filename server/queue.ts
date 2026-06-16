// Shared shape of a single Gmail-sync job. The BullMQ queue instance and
// enqueue logic are added in Phase 3 (EC2 server + BullMQ).
export const SYNC_QUEUE_NAME = "email-sync";

export type SyncJob = {
  userId: string;
  integrationId: string;
};
