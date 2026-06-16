import express, { type Request, type Response } from "express";
import { serverConfig } from "./config";
import { enqueueSyncJobs, type SyncJob } from "./queue";

const SYNC_SECRET_HEADER = "x-secret";

// Express API that receives sync jobs from Vercel cron and enqueues them.
export function createServer() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post("/sync", handleSync);

  return app;
}

async function handleSync(req: Request, res: Response) {
  if (req.headers[SYNC_SECRET_HEADER] !== serverConfig.syncSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const enqueued = await enqueueSyncJobs(parseJobs(req.body));
    res.json({ ok: true, enqueued });
  } catch (error) {
    console.error("[SERVER] Failed to enqueue sync jobs");
    console.error(error);
    res.status(500).json({ error: "Failed to enqueue jobs." });
  }
}

function parseJobs(body: unknown): SyncJob[] {
  if (!body || typeof body !== "object" || !("jobs" in body)) {
    return [];
  }

  const jobs = body.jobs;

  return Array.isArray(jobs) ? jobs.filter(isSyncJob) : [];
}

function isSyncJob(value: unknown): value is SyncJob {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "userId" in value &&
    typeof value.userId === "string" &&
    "integrationId" in value &&
    typeof value.integrationId === "string"
  );
}

function startServer() {
  const app = createServer();

  app.listen(serverConfig.serverPort, () => {
    console.log(`[SERVER] Listening on port ${serverConfig.serverPort}`);
  });
}

startServer();
