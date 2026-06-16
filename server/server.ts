import { serverConfig } from "./config";

// Express API that receives sync jobs from Vercel and enqueues them.
// Route handlers + auth check are not implemented yet.
export function createServer(): never {
  throw new Error(
    `SyncPilot server is not implemented yet (target port ${serverConfig.serverPort})`,
  );
}
