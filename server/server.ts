import { serverConfig } from "./config";

// Express API that receives sync jobs from Vercel and enqueues them.
// Route handlers + auth check are added in Phase 3.
export function createServer(): never {
  throw new Error(
    `SyncPilot server is implemented in Phase 3 (target port ${serverConfig.serverPort})`,
  );
}
