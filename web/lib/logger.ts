import pino, { type Logger } from "pino";

// Structured app logger for the Next.js app. It writes JSON to stdout rather
// than using a pino transport: transports run in worker threads, which are
// fragile under Next.js serverless bundling and can drop buffered logs when a
// short-lived function returns. On Vercel, ship these stdout logs to Better
// Stack with a Log Drain (the long-running EC2 worker uses the direct
// @logtail/pino transport instead — see server/logger.ts).
//
// Preserve the existing "[SCOPE]" convention by passing a scope to
// scopedLogger(); it becomes a structured `scope` field.
let rootLogger: Logger | null = null;

function getRootLogger(): Logger {
  if (!rootLogger) {
    rootLogger = pino({ level: process.env.LOG_LEVEL ?? "info" });
  }

  return rootLogger;
}

export function scopedLogger(scope: string): Logger {
  return getRootLogger().child({ scope });
}
