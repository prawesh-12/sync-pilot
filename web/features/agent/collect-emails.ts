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
import type { ResolvedAccount } from "./types";

// Due snoozed emails plus the fresh, not-yet-handled time-window batch.
export async function collectEmails(
  account: ResolvedAccount,
  windowEnd: Date,
): Promise<GmailEmail[]> {
  const resurfaced = await collectSnoozedEmails(account, windowEnd);
  const fresh = await fetchEmailsInTimeWindow(account, windowEnd);
  const unhandled = await dropHandledEmails(account.userId, fresh);

  return dedupeByMessageId([...resurfaced, ...unhandled]);
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

  console.log(
    `[AGENT] Resurfacing ${due.length} snoozed emails for userId: ${account.userId}`,
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
    console.error(
      `[AGENT] Could not resurface message ${messageId} for userId: ${account.userId}`,
    );
    console.error(error);

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
