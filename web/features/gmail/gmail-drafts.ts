import { executeGmailTool } from "@/lib/composio";
import { findString } from "@/features/gmail/parse";
import type { GmailActionAccount } from "@/features/gmail/gmail";

const GMAIL_CREATE_DRAFT_TOOL = "GMAIL_CREATE_EMAIL_DRAFT";
const GMAIL_SEND_DRAFT_TOOL = "GMAIL_SEND_DRAFT";
const GMAIL_DELETE_DRAFT_TOOL = "GMAIL_DELETE_DRAFT";
const EMAIL_ADDRESS_PATTERN = /<([^>]+)>/;

type DraftReplyInput = {
  threadId: string;
  replyTo: string;
  body: string;
};

// Saves a threaded reply draft; subject is omitted so Gmail keeps the thread.
export async function createDraftReply(
  account: GmailActionAccount,
  input: DraftReplyInput,
): Promise<string> {
  const result = await executeGmailTool(
    account.userId,
    GMAIL_CREATE_DRAFT_TOOL,
    {
      recipient_email: extractEmailAddress(input.replyTo),
      body: input.body,
      is_html: false,
      ...(input.threadId ? { thread_id: input.threadId } : {}),
    },
    account.connectedAccountId,
  );
  const draftId =
    findString(result.data, ["draftId", "draft_id"]) ||
    findString(result.data, ["id"]);

  if (!draftId) {
    throw new Error("Gmail did not return a draft id.");
  }

  return draftId;
}

// Sends an existing draft to the recipients already on it. Used after the user
// confirms on Signal; never called automatically during triage.
export async function sendDraftReply(
  account: GmailActionAccount,
  draftId: string,
): Promise<void> {
  await executeGmailTool(
    account.userId,
    GMAIL_SEND_DRAFT_TOOL,
    { draft_id: draftId },
    account.connectedAccountId,
  );
}

// Permanently deletes a draft when the user discards or revises it on Signal.
export async function deleteDraftReply(
  account: GmailActionAccount,
  draftId: string,
): Promise<void> {
  await executeGmailTool(
    account.userId,
    GMAIL_DELETE_DRAFT_TOOL,
    { draft_id: draftId },
    account.connectedAccountId,
  );
}

// Sender headers look like "Name <addr@x.com>"; pull out the address.
function extractEmailAddress(sender: string): string {
  const match = sender.match(EMAIL_ADDRESS_PATTERN);

  if (match) {
    return match[1].trim();
  }

  return sender.trim();
}
