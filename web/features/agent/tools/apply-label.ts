import { tool } from "ai";
import { z } from "zod";
import { applyLabelToEmail } from "@/features/gmail/gmail-actions";
import { recordAction } from "./record-action";
import type { TriageToolContext } from "./types";

// Categorizes the email under a Gmail label, creating the label if needed.
export function createApplyLabelTool(ctx: TriageToolContext) {
  const account = { userId: ctx.userId, connectedAccountId: ctx.connectedAccountId };

  return tool({
    description:
      "Apply a Gmail label to categorize this email. Creates the label if it does not exist.",
    inputSchema: z.object({
      label: z
        .string()
        .min(1)
        .describe("Short label name to apply, e.g. 'Receipts' or 'Recruiting'."),
      reason: z
        .string()
        .min(1)
        .describe("One sentence explaining why this label fits."),
    }),
    execute: async ({ label, reason }) =>
      recordAction(ctx, {
        decision: "apply_label",
        toolName: "applyLabel",
        reason,
        args: { label, reason },
        run: () => applyLabelToEmail(account, ctx.email.messageId, label),
      }),
  });
}
