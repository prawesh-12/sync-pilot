import pino, { type Logger } from "pino";

// Structured logger for the intake server + worker. Ships to Better Stack when
// BETTERSTACK_SOURCE_TOKEN is set; otherwise writes JSON to stdout (captured by
// the process manager / container logs). Use scopedLogger("WORKER") etc.
function buildLogger(): Logger {
  const level = process.env.LOG_LEVEL ?? "info";
  const sourceToken = process.env.BETTERSTACK_SOURCE_TOKEN;
  const ingestingHost = process.env.BETTERSTACK_INGESTING_HOST;

  if (sourceToken) {
    return pino({
      level,
      transport: {
        target: "@logtail/pino",
        options: {
          sourceToken,
          ...(ingestingHost ? { options: { endpoint: ingestingHost } } : {}),
        },
      },
    });
  }

  return pino({ level });
}

const rootLogger = buildLogger();

export function scopedLogger(scope: string): Logger {
  return rootLogger.child({ scope });
}
