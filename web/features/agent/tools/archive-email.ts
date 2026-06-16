import { tool } from "ai";
import { z } from "zod";
import { archiveEmail } from "@/features/gmail/gmail-actions";
import { markEmailArchived } from "@/db/queries";
import { recordAction } from "./record-action";
import type { TriageToolContext } from "./types";

// Removes the email from the Gmail inbox; use for low-priority mail needing no reply.
export function createArchiveEmailTool(ctx: TriageToolContext) {
  const account = { userId: ctx.userId, connectedAccountId: ctx.connectedAccountId };

  return tool({
    description:
      "Archive this email: remove it from the Gmail inbox. Use for low-priority mail that needs no reply.",
    inputSchema: z.object({
      reason: z
        .string()
        .min(1)
        .describe("One sentence explaining why this email can be archived."),
    }),
    execute: async ({ reason }) =>
      recordAction(ctx, {
        decision: "archive",
        toolName: "archiveEmail",
        reason,
        args: { reason },
        run: async () => {
          await archiveEmail(account, ctx.email.messageId);
          await markEmailArchived(ctx.userId, ctx.email.messageId);
        },
      }),
  });
}
