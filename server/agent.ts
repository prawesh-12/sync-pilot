import { serverConfig } from "./config";
import type { SyncJob } from "./queue";

const RUN_JOB_PATH = "/api/agent/run-job";
const SYNC_SECRET_HEADER = "x-secret";
// Agent runs can span many emails and AI calls, so allow a generous window.
const REQUEST_TIMEOUT_MS = 300_000;

// Runs one Gmail-sync job by delegating to the web app's agent endpoint, which
// owns the Gmail/Groq/Signal stack. Keeps that logic single-sourced; throwing
// here lets BullMQ retry the job.
export async function runAgent(job: SyncJob): Promise<void> {
  if (!serverConfig.webAppUrl) {
    throw new Error("WEB_APP_URL is not configured.");
  }

  const endpoint = new URL(RUN_JOB_PATH, serverConfig.webAppUrl).toString();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [SYNC_SECRET_HEADER]: serverConfig.syncSecret,
    },
    body: JSON.stringify(job),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await readErrorDetail(response);

    throw new Error(
      `Agent run failed for integration ${job.integrationId} (status ${response.status}): ${detail}`,
    );
  }
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (data && typeof data === "object" && "error" in data) {
      return String(data.error);
    }
  } catch {
    // No JSON body; fall through to a generic message.
  }

  return "no error detail";
}
