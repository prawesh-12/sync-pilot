// Shared shape of a single Gmail-sync job; the BullMQ queue is not wired yet.
export const SYNC_QUEUE_NAME = "email-sync";

export type SyncJob = {
  userId: string;
  integrationId: string;
};
