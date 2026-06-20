import { and, eq, inArray, lte, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  processedEmails,
  type ProcessedEmailStatusValue,
} from "@/db/schema";

type ProcessedEmailState = {
  status: ProcessedEmailStatusValue;
  snoozedUntil: Date | null;
  gmailDraftId: string | null;
};

export async function markEmailArchived(userId: string, messageId: string) {
  return setProcessedEmail(userId, messageId, {
    status: "archived",
    snoozedUntil: null,
    gmailDraftId: null,
  });
}

export async function markEmailActive(userId: string, messageId: string) {
  return setProcessedEmail(userId, messageId, {
    status: "active",
    snoozedUntil: null,
    gmailDraftId: null,
  });
}

export async function markEmailSnoozed(
  userId: string,
  messageId: string,
  snoozedUntil: Date,
) {
  return setProcessedEmail(userId, messageId, {
    status: "snoozed",
    snoozedUntil,
    gmailDraftId: null,
  });
}

export async function markEmailDrafted(
  userId: string,
  messageId: string,
  gmailDraftId: string,
) {
  return setProcessedEmail(userId, messageId, {
    status: "drafted",
    snoozedUntil: null,
    gmailDraftId,
  });
}

// Records an email as handled so a later run does not re-triage it. Used for
// decisions that have no side-effecting status of their own (summary, ignore).
export async function markEmailNotified(userId: string, messageId: string) {
  return setProcessedEmail(userId, messageId, {
    status: "notified",
    snoozedUntil: null,
    gmailDraftId: null,
  });
}

// Claims an email for processing so exactly one run notifies on it, closing the
// duplicate-notification race between overlapping cron ticks. Returns true if
// THIS run won the claim and should triage + notify.
//
// A fresh email (no row) is inserted and won. A resurfaced due email already has
// a row in a claimable state ("snoozed" or freshly "active"), so the conditional
// DO UPDATE flips it to "notified" and wins — but only for the first run, since
// the second sees status "notified" (not claimable) and loses. Already-handled
// emails ("notified"/"drafted"/"archived") are never re-claimed.
const CLAIMABLE_STATUSES: ProcessedEmailStatusValue[] = ["snoozed", "active"];

export async function claimEmailForProcessing(
  userId: string,
  messageId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .insert(processedEmails)
    .values({
      messageId,
      userId,
      status: "notified",
      snoozedUntil: null,
      gmailDraftId: null,
    })
    .onConflictDoUpdate({
      target: processedEmails.messageId,
      set: { status: "notified", snoozedUntil: null, gmailDraftId: null },
      setWhere: inArray(processedEmails.status, CLAIMABLE_STATUSES),
    })
    .returning({ messageId: processedEmails.messageId });

  return rows.length > 0;
}

// Backstop for a self-persisting tool (draft/snooze/archive) that FAILED before
// writing its own row: record the email as handled so it is not re-triaged and
// re-notified. Non-clobbering — if the tool actually did write a row (e.g. the
// draft was created but only the Signal send failed), that richer status wins.
export async function markEmailHandledIfAbsent(userId: string, messageId: string) {
  const db = getDb();
  const [row] = await db
    .insert(processedEmails)
    .values({
      messageId,
      userId,
      status: "notified",
      snoozedUntil: null,
      gmailDraftId: null,
    })
    .onConflictDoNothing({ target: processedEmails.messageId })
    .returning({ messageId: processedEmails.messageId });

  return row ?? null;
}

// Of the given message ids, which already have a processed_emails row. Snoozed
// emails are excluded so they can still resurface when their timer is due.
export async function getHandledMessageIds(
  userId: string,
  messageIds: string[],
): Promise<Set<string>> {
  if (messageIds.length === 0) {
    return new Set();
  }

  const db = getDb();
  const rows = await db
    .select({ messageId: processedEmails.messageId })
    .from(processedEmails)
    .where(
      and(
        eq(processedEmails.userId, userId),
        inArray(processedEmails.messageId, messageIds),
        ne(processedEmails.status, "snoozed"),
      ),
    );

  return new Set(rows.map((row) => row.messageId));
}

export async function getDueSnoozedEmails(userId: string, now: Date) {
  const db = getDb();

  return db
    .select({ messageId: processedEmails.messageId })
    .from(processedEmails)
    .where(
      and(
        eq(processedEmails.userId, userId),
        eq(processedEmails.status, "snoozed"),
        lte(processedEmails.snoozedUntil, now),
      ),
    );
}

async function setProcessedEmail(
  userId: string,
  messageId: string,
  state: ProcessedEmailState,
) {
  const db = getDb();
  const [row] = await db
    .insert(processedEmails)
    .values({ messageId, userId, ...state })
    .onConflictDoUpdate({
      target: processedEmails.messageId,
      set: { ...state },
    })
    .returning({ messageId: processedEmails.messageId });

  return row ?? null;
}
