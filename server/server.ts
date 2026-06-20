import express, { type Express, type Request, type Response } from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { serverConfig } from "./config";
import { enqueueSyncJobs, getEmailQueue, type SyncJob } from "./queue";
import { secureEquals } from "./secure-compare";
import { basicAuth } from "./basic-auth";
import { scopedLogger } from "./logger";

const SYNC_SECRET_HEADER = "x-secret";
const QUEUE_DASHBOARD_PATH = "/admin/queues";

const log = scopedLogger("SERVER");

// Express API that receives sync jobs from Vercel cron and enqueues them.
export function createServer() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post("/sync", handleSync);

  mountQueueDashboard(app);

  return app;
}

// Mounts the BullMQ dashboard behind Basic auth, but only when credentials are
// configured — so it can never be exposed unauthenticated by accident.
function mountQueueDashboard(app: Express) {
  if (!serverConfig.queueDashboardUser || !serverConfig.queueDashboardPassword) {
    log.warn(
      "Queue dashboard not mounted: set QUEUE_DASHBOARD_USER and QUEUE_DASHBOARD_PASSWORD to enable it",
    );
    return;
  }

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(QUEUE_DASHBOARD_PATH);
  createBullBoard({
    queues: [new BullMQAdapter(getEmailQueue())],
    serverAdapter,
  });

  app.use(QUEUE_DASHBOARD_PATH, basicAuth, serverAdapter.getRouter());
  log.info(`Queue dashboard mounted at ${QUEUE_DASHBOARD_PATH}`);
}

async function handleSync(req: Request, res: Response) {
  if (!secureEquals(req.headers[SYNC_SECRET_HEADER], serverConfig.syncSecret)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const enqueued = await enqueueSyncJobs(parseJobs(req.body));
    res.json({ ok: true, enqueued });
  } catch (error) {
    log.error({ err: String(error) }, "failed to enqueue sync jobs");
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
    log.info(`Listening on port ${serverConfig.serverPort}`);
  });
}

startServer();
