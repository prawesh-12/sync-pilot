import { serverConfig } from "./config";
import { scopedLogger } from "./logger";

const REPORT_PATH = "/api/internal/sync-jobs";
const SYNC_SECRET_HEADER = "x-secret";
const REPORT_TIMEOUT_MS = 10_000;

const log = scopedLogger("WORKER");

export type SyncJobStatus =
  | "enqueued"
  | "active"
  | "completed"
  | "failed"
  | "dead";

export type SyncJobReport = {
  bullJobId: string;
  userId: string;
  integrationId: string;
  status: SyncJobStatus;
  attempts?: number;
  error?: string;
};

// Reports a queued-job transition to the web app, which persists it to Postgres.
// Best-effort: a reporting failure must never affect job processing, so it is
// caught and logged, not thrown.
export async function reportJobStatus(report: SyncJobReport): Promise<void> {
  if (!serverConfig.webAppUrl) {
    return;
  }

  try {
    const endpoint = new URL(REPORT_PATH, serverConfig.webAppUrl).toString();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [SYNC_SECRET_HEADER]: serverConfig.syncSecret,
      },
      body: JSON.stringify(report),
      signal: AbortSignal.timeout(REPORT_TIMEOUT_MS),
    });

    if (!response.ok) {
      log.warn(
        { bullJobId: report.bullJobId, httpStatus: response.status },
        "sync-job status report rejected",
      );
    }
  } catch (error) {
    log.warn(
      { bullJobId: report.bullJobId, err: String(error) },
      "sync-job status report failed",
    );
  }
}
