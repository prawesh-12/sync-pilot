import { z } from "zod";
import {
  createDraftReply,
  deleteDraftReply,
  sendDraftReply,
} from "@/features/gmail/gmail-drafts";
import { rewriteDraftBody } from "@/features/ai/rewrite-draft";
import {
  sendDraftReadyMessage,
  sendSignalNotice,
} from "@/features/signal/signal";
import {
  parseReply,
  type ParsedReply,
  type PendingAction,
} from "@/features/signal/parse-reply";
import {
  markEmailDrafted,
  recordAgentFeedback,
  resolvePendingAction,
  updatePendingActionPayload,
} from "@/db/queries";
import type { GmailActionAccount } from "@/features/gmail/gmail";

const DRAFT_PREVIEW_MAX_CHARACTERS = 100;
const FAILURE_NOTICE =
  "Something went wrong handling that reply. Please try again.";
const FREEFORM_NOTICE =
  'Freeform commands are not supported yet. Reply with a draft ref code, e.g. "A3X9 send".';

// Shape stored by the draftReply tool; validated before any Gmail action runs.
const draftPayloadSchema = z.object({
  draftId: z.string().min(1),
  body: z.string().min(1),
  connectedAccountId: z.string().min(1),
  threadId: z.string().default(""),
  replyTo: z.string().min(1),
  subject: z.string().default("(No subject)"),
});

type DraftPayload = z.infer<typeof draftPayloadSchema>;

// Routes one inbound Signal message to its action and always acks the user.
export async function handleSignalReply(
  userId: string,
  message: string,
): Promise<void> {
  const parsed = await parseReply({ message, userId });

  try {
    await dispatchReply(userId, parsed);
  } catch (error) {
    console.error(`[SIGNAL] Failed to handle reply for userId: ${userId}`);
    console.error(error);
    await sendSignalNotice(userId, FAILURE_NOTICE);
  }
}

async function dispatchReply(
  userId: string,
  parsed: ParsedReply,
): Promise<void> {
  switch (parsed.kind) {
    case "draft_send":
      return confirmDraftSend(userId, parsed.pending);
    case "draft_discard":
      return discardDraft(userId, parsed.pending);
    case "draft_revise":
      return reviseDraft(userId, parsed.pending, parsed.instructions);
    case "ref_usage":
      return sendUsageHint(userId, parsed.refCode);
    case "freeform":
      await sendSignalNotice(userId, FREEFORM_NOTICE);
      return;
    default: {
      const exhaustive: never = parsed;
      throw new Error(`Unhandled reply kind: ${JSON.stringify(exhaustive)}`);
    }
  }
}

async function confirmDraftSend(
  userId: string,
  pending: PendingAction,
): Promise<void> {
  const payload = draftPayloadSchema.parse(pending.payload);
  await sendDraftReply(accountFor(userId, payload), payload.draftId);
  await resolvePendingAction(pending.id, "confirmed");
  await sendSignalNotice(userId, `Sent your reply for: ${payload.subject}`);
}

async function discardDraft(
  userId: string,
  pending: PendingAction,
): Promise<void> {
  const payload = draftPayloadSchema.parse(pending.payload);
  await deleteDraftReply(accountFor(userId, payload), payload.draftId);
  await resolvePendingAction(pending.id, "discarded");
  await logDiscardFeedback(userId, pending, payload);
  await sendSignalNotice(userId, `Discarded the draft for: ${payload.subject}`);
}

// Best-effort: a discarded draft is a clear "don't draft this" signal that the
// triage prompt later folds in. Never block the discard ack on a logging error.
async function logDiscardFeedback(
  userId: string,
  pending: PendingAction,
  payload: DraftPayload,
) {
  try {
    await recordAgentFeedback({
      userId,
      gmailMessageId: pending.gmailMessageId,
      subject: payload.subject,
      decision: "draft_reply",
      action: "discarded",
    });
  } catch (error) {
    console.error(`[SIGNAL] Failed to record feedback for userId: ${userId}`);
    console.error(error);
  }
}

async function reviseDraft(
  userId: string,
  pending: PendingAction,
  instructions: string,
): Promise<void> {
  const payload = draftPayloadSchema.parse(pending.payload);
  const account = accountFor(userId, payload);
  const newBody = await rewriteDraftBody({
    original: payload.body,
    instructions,
  });
  await deleteDraftReply(account, payload.draftId);
  const newDraftId = await createDraftReply(account, {
    threadId: payload.threadId,
    replyTo: payload.replyTo,
    body: newBody,
  });
  await markEmailDrafted(userId, pending.gmailMessageId, newDraftId);
  await updatePendingActionPayload(pending.id, {
    ...payload,
    draftId: newDraftId,
    body: newBody,
  });
  await sendDraftReadyMessage(
    {
      subject: payload.subject,
      preview: newBody.slice(0, DRAFT_PREVIEW_MAX_CHARACTERS),
      refCode: pending.refCode,
    },
    userId,
  );
}

async function sendUsageHint(userId: string, refCode: string): Promise<void> {
  await sendSignalNotice(
    userId,
    [
      `Reply "${refCode} send" to send`,
      `Reply "${refCode} no" to discard`,
      `Reply "${refCode} [edit instructions]" to revise`,
    ].join("\n"),
  );
}

function accountFor(
  userId: string,
  payload: DraftPayload,
): GmailActionAccount {
  return { userId, connectedAccountId: payload.connectedAccountId };
}
