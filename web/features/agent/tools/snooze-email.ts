import { tool } from "ai";
import { z } from "zod";
import { markEmailSnoozed } from "@/db/queries";
import { scopedLogger } from "@/lib/logger";
import { recordAction } from "./record-action";
import type { TriageToolContext } from "./types";

const log = scopedLogger("AGENT");

const DEFAULT_SNOOZE_HOURS = 24;
const MS_PER_HOUR = 60 * 60 * 1000;

// App-level snooze: Gmail has no snooze API, so we defer the email in our table.
export function createSnoozeEmailTool(ctx: TriageToolContext) {
  return tool({
    description:
      "Snooze this email until a later time, when it returns to triage. Use for mail to handle later.",
    inputSchema: z.object({
      until: z
        .string()
        .min(1)
        .describe("ISO 8601 timestamp for when the email should resurface."),
      reason: z
        .string()
        .min(1)
        .describe("One sentence explaining why this email is being deferred."),
    }),
    execute: async ({ until, reason }) => {
      const snoozedUntil = parseSnoozeUntil(until);

      return recordAction(ctx, {
        decision: "snooze",
        toolName: "snoozeEmail",
        reason,
        args: { until: snoozedUntil.toISOString(), reason },
        run: () =>
          markEmailSnoozed(ctx.userId, ctx.email.messageId, snoozedUntil),
      });
    },
  });
}

// Falls back to a fixed delay when the model gives a missing or past timestamp.
function parseSnoozeUntil(until: string): Date {
  const parsed = new Date(until);
  const isUsable =
    !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now();

  if (isUsable) {
    return parsed;
  }

  log.warn(
    { until, defaultHours: DEFAULT_SNOOZE_HOURS },
    "unusable snooze target; using default",
  );

  return new Date(Date.now() + DEFAULT_SNOOZE_HOURS * MS_PER_HOUR);
}
