import { logs, SeverityNumber, type LogAttributes } from "@opentelemetry/api-logs";

const LOGGER_NAME = "syncpilot-server";
const DEFAULT_LEVEL = "info";
const SILENT_LEVEL = "silent";

const LEVELS = {
  debug: { rank: 20, severityNumber: SeverityNumber.DEBUG },
  info: { rank: 30, severityNumber: SeverityNumber.INFO },
  warn: { rank: 40, severityNumber: SeverityNumber.WARN },
  error: { rank: 50, severityNumber: SeverityNumber.ERROR },
} as const;

const SILENT_RANK = 100;

type Level = keyof typeof LEVELS;
type Fields = Record<string, unknown>;

export type ScopedLogger = Record<
  Level,
  (fieldsOrMessage: Fields | string, message?: string) => void
>;

function readThreshold(): number {
  const level = process.env.LOG_LEVEL?.trim().toLowerCase();

  if (level === SILENT_LEVEL) {
    return SILENT_RANK;
  }

  if (level && level in LEVELS) {
    return LEVELS[level as Level].rank;
  }

  return LEVELS[DEFAULT_LEVEL].rank;
}

function toAttributeValue(value: unknown): string | number | boolean {
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return JSON.stringify(value) ?? String(value);
}

function toAttributes(fields: Fields): LogAttributes {
  const attributes: LogAttributes = {};

  for (const [key, value] of Object.entries(fields)) {
    attributes[key] = toAttributeValue(value);
  }

  return attributes;
}

function splitArguments(
  fieldsOrMessage: Fields | string,
  message?: string,
): { body: string; attributes: LogAttributes } {
  if (typeof fieldsOrMessage === "string") {
    return { body: fieldsOrMessage, attributes: {} };
  }

  return { body: message ?? "", attributes: toAttributes(fieldsOrMessage) };
}

function write(
  scope: string,
  level: Level,
  fieldsOrMessage: Fields | string,
  message?: string,
): void {
  if (LEVELS[level].rank < readThreshold()) {
    return;
  }

  const { body, attributes } = splitArguments(fieldsOrMessage, message);
  const time = new Date().toISOString();

  // stdout still works when the remote endpoint is down.
  console.log(JSON.stringify({ time, level, scope, msg: body, ...attributes }));

  logs.getLogger(LOGGER_NAME).emit({
    severityNumber: LEVELS[level].severityNumber,
    severityText: level.toUpperCase(),
    body,
    attributes: { scope, ...attributes },
  });
}

export function scopedLogger(scope: string): ScopedLogger {
  return {
    debug: (fieldsOrMessage, message) => write(scope, "debug", fieldsOrMessage, message),
    info: (fieldsOrMessage, message) => write(scope, "info", fieldsOrMessage, message),
    warn: (fieldsOrMessage, message) => write(scope, "warn", fieldsOrMessage, message),
    error: (fieldsOrMessage, message) => write(scope, "error", fieldsOrMessage, message),
  };
}
