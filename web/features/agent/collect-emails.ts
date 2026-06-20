import {
  fetchEmailById,
  fetchEmailsInTimeWindow,
  type GmailEmail,
} from "@/features/gmail/gmail";
import {
  getDueSnoozedEmails,
  getHandledMessageIds,
  markEmailActive,
} from "@/db/queries";
import { scopedLogger } from "@/lib/logger";
import type { ResolvedAccount } from "./types";

const log = scopedLogger("AGENT");

// "Name <addr@x.com>" -> "addr@x.com"; bare addresses pass through.
const EMAIL_ADDRESS_PATTERN = /<([^>]+)>/;

// Due snoozed emails plus the fresh, not-yet-handled time-window batch.
export async function collectEmails(
  account: ResolvedAccount,
  windowEnd: Date,
): Promise<GmailEmail[]> {
  const resurfaced = await collectSnoozedEmails(account, windowEnd);
  const fresh = await fetchEmailsInTimeWindow(account, windowEnd);
  const unhandled = await dropHandledEmails(account.userId, fresh);
  const combined = dedupeByMessageId([...resurfaced, ...unhandled]);

  return dropSelfSentEmails(combined, account.emailAddress);
}

// Never act on a message this account sent itself. When both correspondents'
// accounts are connected, only the RECIPIENT should draft a reply — the sender's
// own copy must not trigger a draft (or any notification) back to themselves.
export function dropSelfSentEmails(
  emails: GmailEmail[],
  ownAddress: string | null,
): GmailEmail[] {
  const own = ownAddress?.trim().toLowerCase();

  if (!own) {
    return emails;
  }

  const kept = emails.filter((email) => extractAddress(email.from) !== own);

  if (kept.length !== emails.length) {
    log.info(
      { dropped: emails.length - kept.length, account: own },
      "skipped self-sent emails",
    );
  }

  return kept;
}

function extractAddress(sender: string): string {
  const match = sender.match(EMAIL_ADDRESS_PATTERN);

  return (match ? match[1] : sender).trim().toLowerCase();
}

// Skip emails already triaged in a prior run so each one is handled once.
async function dropHandledEmails(
  userId: string,
  emails: GmailEmail[],
): Promise<GmailEmail[]> {
  const handled = await getHandledMessageIds(
    userId,
    emails.map((email) => email.messageId),
  );

  return emails.filter((email) => !handled.has(email.messageId));
}

async function collectSnoozedEmails(
  account: ResolvedAccount,
  now: Date,
): Promise<GmailEmail[]> {
  const due = await getDueSnoozedEmails(account.userId, now);

  if (due.length === 0) {
    return [];
  }

  log.info(
    { count: due.length, userId: account.userId },
    "resurfacing snoozed emails",
  );

  const emails: GmailEmail[] = [];

  for (const row of due) {
    const email = await resurfaceSnoozedEmail(account, row.messageId);

    if (email) {
      emails.push(email);
    }
  }

  return emails;
}

async function resurfaceSnoozedEmail(
  account: ResolvedAccount,
  messageId: string,
): Promise<GmailEmail | null> {
  try {
    const email = await fetchEmailById(account, messageId);

    if (!email) {
      return null;
    }

    await markEmailActive(account.userId, messageId);

    return email;
  } catch (error) {
    // Likely belongs to another connected account; its own run will pick it up.
    log.error(
      { messageId, userId: account.userId, err: error },
      "could not resurface snoozed message",
    );

    return null;
  }
}

function dedupeByMessageId(emails: GmailEmail[]): GmailEmail[] {
  const seen = new Set<string>();
  const unique: GmailEmail[] = [];

  for (const email of emails) {
    if (seen.has(email.messageId)) {
      continue;
    }

    seen.add(email.messageId);
    unique.push(email);
  }

  return unique;
}
