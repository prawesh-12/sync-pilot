import { and, eq, lte } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  processedEmails,
  type ProcessedEmailStatusValue,
} from "@/db/schema";

export async function markEmailArchived(userId: string, messageId: string) {
  return setProcessedEmailStatus(userId, messageId, "archived", null);
}

export async function markEmailActive(userId: string, messageId: string) {
  return setProcessedEmailStatus(userId, messageId, "active", null);
}

export async function markEmailSnoozed(
  userId: string,
  messageId: string,
  snoozedUntil: Date,
) {
  return setProcessedEmailStatus(userId, messageId, "snoozed", snoozedUntil);
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

async function setProcessedEmailStatus(
  userId: string,
  messageId: string,
  status: ProcessedEmailStatusValue,
  snoozedUntil: Date | null,
) {
  const db = getDb();
  const [row] = await db
    .insert(processedEmails)
    .values({ messageId, userId, status, snoozedUntil })
    .onConflictDoUpdate({
      target: processedEmails.messageId,
      set: { status, snoozedUntil },
    })
    .returning({ messageId: processedEmails.messageId });

  return row ?? null;
}
