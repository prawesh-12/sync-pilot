import { tool } from "ai";
import { z } from "zod";
import { createDraftReply } from "@/features/gmail/gmail-drafts";
import { sendDraftReadyMessage } from "@/features/signal/signal";
import { markEmailDrafted, savePendingAction } from "@/db/queries";
import type { TriageToolContext } from "./types";

const DRAFT_PREVIEW_MAX_CHARACTERS = 100;

// Writes a reply, saves it to Gmail Drafts, and asks the user to confirm on
// Signal with a ref code. Nothing is ever sent automatically.
export function createDraftReplyTool(ctx: TriageToolContext) {
  const account = { userId: ctx.userId, connectedAccountId: ctx.connectedAccountId };

  return tool({
    description:
      "Write a reply and save it to Gmail Drafts for the user to confirm on Signal. Never sends. Use when the email needs a personal response.",
    inputSchema: z.object({
      body: z.string().min(1).describe("The full reply text to save as a draft."),
      reason: z
        .string()
        .min(1)
        .describe("One sentence explaining why a reply is warranted."),
    }),
    execute: async ({ body, reason }) => {
      const notified = await draftAndQueue(ctx, account, body);

      ctx.record({
        decision: "draft_reply",
        reasoning: reason,
        notified,
        toolCall: {
          name: "draftReply",
          args: notified ? { reason } : { reason, failed: true },
        },
      });

      return { notified };
    },
  });
}

async function draftAndQueue(
  ctx: TriageToolContext,
  account: { userId: string; connectedAccountId: string },
  body: string,
): Promise<boolean> {
  try {
    const draftId = await createDraftReply(account, {
      threadId: ctx.email.threadId,
      replyTo: ctx.email.from,
      body,
    });
    await markEmailDrafted(ctx.userId, ctx.email.messageId, draftId);
    const pending = await savePendingAction({
      userId: ctx.userId,
      gmailMessageId: ctx.email.messageId,
      actionType: "draft_reply",
      payload: { draftId, body },
    });

    return notifyDraftReady(ctx, body, pending?.refCode);
  } catch (error) {
    console.error(
      `[AGENT] draftReply failed for userId: ${ctx.userId}, message: ${ctx.email.messageId}`,
    );
    console.error(error);

    return false;
  }
}

async function notifyDraftReady(
  ctx: TriageToolContext,
  body: string,
  refCode: string | undefined,
): Promise<boolean> {
  if (!refCode) {
    return false;
  }

  const result = await sendDraftReadyMessage(
    {
      subject: ctx.email.subject,
      preview: body.slice(0, DRAFT_PREVIEW_MAX_CHARACTERS),
      refCode,
    },
    ctx.userId,
  );

  return result.ok;
}
