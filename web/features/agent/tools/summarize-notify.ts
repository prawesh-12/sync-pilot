import { tool } from "ai";
import { z } from "zod";
import { summariseAndNotify } from "./notify";
import type { TriageToolContext } from "./types";

// Summarise the email and notify on Signal; the default informational action.
export function createSummarizeNotifyTool(ctx: TriageToolContext) {
  return tool({
    description:
      "Summarise this email and send the summary to the user on Signal. The default action for any informational email; pick this when unsure.",
    inputSchema: z.object({
      reason: z
        .string()
        .min(1)
        .describe("One sentence explaining why this email warrants a summary."),
    }),
    execute: async ({ reason }) => {
      const { notified, usage } = await summariseAndNotify(ctx.email, ctx.userId);
      ctx.recordUsage(usage);

      ctx.record({
        decision: "summarize_notify",
        reasoning: reason,
        notified,
        toolCall: { name: "summarizeAndNotify", args: { reason } },
      });

      return { notified };
    },
  });
}
