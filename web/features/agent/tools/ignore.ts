import { tool } from "ai";
import { z } from "zod";
import type { TriageToolContext } from "./types";

// No-op action: logs the reasoning but sends nothing.
export function createIgnoreTool(ctx: TriageToolContext) {
  return tool({
    description:
      "Ignore this email. Sends no notification. Use for newsletters, automated no-reply senders, and already-resolved threads.",
    inputSchema: z.object({
      reason: z
        .string()
        .min(1)
        .describe("One sentence explaining why this email can be ignored."),
    }),
    execute: async ({ reason }) => {
      ctx.record({
        decision: "ignore",
        reasoning: reason,
        notified: false,
        toolCall: { name: "ignore", args: { reason } },
      });

      console.log(`[AGENT] Ignored: ${ctx.email.subject} — ${reason}`);

      return { notified: false };
    },
  });
}
