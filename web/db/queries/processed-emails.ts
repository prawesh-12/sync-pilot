import { and, eq, lte } from "drizzle-orm";
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
