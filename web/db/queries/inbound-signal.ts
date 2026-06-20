import { and, asc, eq, inArray, lt, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  inboundSignalMessages,
  type InboundSignalStatusValue,
} from "@/db/schema";

const MAX_ERROR_LENGTH = 1000;

export type NewInboundMessage = {
  userId: string;
  sourceNumber: string;
  text: string;
  signalTimestamp: number;
};

export type ProcessableInboundMessage = {
  id: string;
  userId: string;
  text: string;
  attempts: number;
};

// Persists drained messages before any processing. onConflictDoNothing on
// (sourceNumber, signalTimestamp) makes a re-drain of the same message a no-op,
// so overlapping polls can't create duplicates.
export async function saveInboundMessages(
  messages: NewInboundMessage[],
): Promise<void> {
  if (messages.length === 0) {
    return;
  }

  const db = getDb();
  await db
    .insert(inboundSignalMessages)
    .values(messages.map((message) => ({ ...message, status: "received" as const })))
    .onConflictDoNothing({
      target: [
        inboundSignalMessages.sourceNumber,
        inboundSignalMessages.signalTimestamp,
      ],
    });
}

// Messages ready to (re)process for the given users: freshly received, plus
// previously failed ones still under the retry cap. Ordered oldest-first so a
// "revise" reply is handled before a later "send".
export async function getProcessableInboundMessages(
  userIds: string[],
  maxAttempts: number,
): Promise<ProcessableInboundMessage[]> {
  if (userIds.length === 0) {
    return [];
  }

  const db = getDb();
  return db
    .select({
      id: inboundSignalMessages.id,
      userId: inboundSignalMessages.userId,
      text: inboundSignalMessages.text,
      attempts: inboundSignalMessages.attempts,
    })
    .from(inboundSignalMessages)
    .where(
      and(
        inArray(inboundSignalMessages.userId, userIds),
        or(
          eq(inboundSignalMessages.status, "received"),
          and(
            eq(inboundSignalMessages.status, "failed"),
            lt(inboundSignalMessages.attempts, maxAttempts),
          ),
        ),
      ),
    )
    .orderBy(asc(inboundSignalMessages.signalTimestamp));
}

export async function markInboundProcessed(id: string): Promise<void> {
  const db = getDb();
  await db
    .update(inboundSignalMessages)
    .set({ status: "processed", processedAt: new Date() })
    .where(eq(inboundSignalMessages.id, id));
}

// Records a failed processing attempt. Returns the resulting status so the
// caller can notify the user once, only when we finally give up ("dead").
export async function markInboundFailed(
  id: string,
  priorAttempts: number,
  maxAttempts: number,
  error: string,
): Promise<InboundSignalStatusValue> {
  const attempts = priorAttempts + 1;
  const status: InboundSignalStatusValue =
    attempts >= maxAttempts ? "dead" : "failed";

  const db = getDb();
  await db
    .update(inboundSignalMessages)
    .set({ status, attempts, lastError: error.slice(0, MAX_ERROR_LENGTH) })
    .where(eq(inboundSignalMessages.id, id));

  return status;
}
