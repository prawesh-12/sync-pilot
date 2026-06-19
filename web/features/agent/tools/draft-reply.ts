import { tool } from "ai";
import { z } from "zod";
import { createDraftReply } from "@/features/gmail/gmail-drafts";
import { sendDraftReadyMessage } from "@/features/signal/signal";
import { summariseAndNotify } from "./notify";
import {
  getPendingActionByMessageId,
  markEmailDrafted,
  savePendingAction,
} from "@/db/queries";
import type { TriageToolContext } from "./types";

// Caps the draft shown on Signal; high enough to show a full reply in one message.
const DRAFT_BODY_MAX_CHARACTERS = 2000;

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
  // Skip if this email already has a draft awaiting confirmation; re-drafting
  // would create a duplicate Gmail draft and a second ref code.
  const existing = await getPendingActionByMessageId(
    ctx.userId,
    ctx.email.messageId,
    "draft_reply",
  );

  if (existing) {
    console.log(
      `[AGENT] Draft already pending for message: ${ctx.email.messageId}, refCode: ${existing.refCode}; skipping.`,
    );

    return false;
  }

  // Summary goes out first so the user has the email's context before the draft.
  await notifyEmailSummary(ctx);

  try {
    const draftId = await createDraftReply(account, {
      threadId: ctx.email.threadId,
      replyTo: ctx.email.from,
      body,
    });
    await markEmailDrafted(ctx.userId, ctx.email.messageId, draftId);
    // Persist everything the Signal reply handler needs to send/discard/revise
    // later without re-fetching the email or guessing the Gmail account.
    const pending = await savePendingAction({
      userId: ctx.userId,
      gmailMessageId: ctx.email.messageId,
      actionType: "draft_reply",
      payload: {
        draftId,
        body,
        connectedAccountId: account.connectedAccountId,
        threadId: ctx.email.threadId,
        replyTo: ctx.email.from,
        subject: ctx.email.subject,
      },
    });
    console.log(
      `[AGENT] Draft pending confirmation saved for message: ${ctx.email.messageId}, refCode: ${pending?.refCode ?? "missing"}`,
    );

    return notifyDraftReady(ctx, body, pending?.refCode);
  } catch (error) {
    console.error(
      `[AGENT] draftReply failed for userId: ${ctx.userId}, message: ${ctx.email.messageId}`,
    );
    console.error(error);

    return false;
  }
}

// Sends the email summary and reports its token usage for accounting.
async function notifyEmailSummary(ctx: TriageToolContext): Promise<void> {
  const { usage } = await summariseAndNotify(ctx.email, ctx.userId);
  ctx.recordUsage(usage);
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
      body: body.slice(0, DRAFT_BODY_MAX_CHARACTERS),
      refCode,
    },
    ctx.userId,
  );

  return result.ok;
}
