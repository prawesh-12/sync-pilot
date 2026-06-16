import { tool } from "ai";
import { z } from "zod";
import { summariseAndNotify } from "./notify";
import type { TriageToolContext } from "./types";

// Same Signal path as summarizeAndNotify but flagged urgent for time-sensitive mail.
export function createEscalateUrgentTool(ctx: TriageToolContext) {
  return tool({
    description:
      "Escalate this email as urgent: summarise it and send it to the user on Signal with an urgent prefix. Use for deadlines, VIP senders, and time-sensitive mail.",
    inputSchema: z.object({
      reason: z
        .string()
        .min(1)
        .describe("One sentence explaining why this email is urgent."),
    }),
    execute: async ({ reason }) => {
      const notified = await summariseAndNotify(ctx.email, ctx.userId, {
        urgent: true,
      });

      ctx.record({
        decision: "escalate",
        reasoning: reason,
        notified,
        toolCall: { name: "escalateUrgent", args: { reason } },
      });

      return { notified };
    },
  });
}
