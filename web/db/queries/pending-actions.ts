import { and, eq, lt } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  pendingActions,
  type PendingActionStatusValue,
  type PendingActionTypeValue,
} from "@/db/schema";

const REF_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const REF_CODE_LENGTH = 4;
const REF_CODE_MAX_ATTEMPTS = 10;
// Pending actions older than this are expired so stale ref codes stop matching.
const STALE_PENDING_ACTION_MS = 24 * 60 * 60 * 1000;

type PendingActionInput = {
  userId: string;
  gmailMessageId: string;
  actionType: PendingActionTypeValue;
  payload: unknown;
};

export async function savePendingAction(input: PendingActionInput) {
  const refCode = await generateUniqueRefCode(input.userId);
  const db = getDb();
  const [row] = await db
    .insert(pendingActions)
    .values({
      userId: input.userId,
      gmailMessageId: input.gmailMessageId,
      actionType: input.actionType,
      payload: input.payload,
      refCode,
    })
    .returning({
      id: pendingActions.id,
      refCode: pendingActions.refCode,
    });

  return row ?? null;
}

export async function getPendingActionByRefCode(userId: string, refCode: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: pendingActions.id,
      gmailMessageId: pendingActions.gmailMessageId,
      actionType: pendingActions.actionType,
      payload: pendingActions.payload,
      refCode: pendingActions.refCode,
    })
    .from(pendingActions)
    .where(
      and(
        eq(pendingActions.userId, userId),
        eq(pendingActions.refCode, refCode),
        eq(pendingActions.status, "pending"),
      ),
    )
    .limit(1);

  return row ?? null;
}

// Finds an open pending action for a specific email so we don't queue a second
// draft (and ref code) for an email that already has one awaiting confirmation.
export async function getPendingActionByMessageId(
  userId: string,
  gmailMessageId: string,
  actionType: PendingActionTypeValue,
) {
  const db = getDb();
  const [row] = await db
    .select({
      id: pendingActions.id,
      gmailMessageId: pendingActions.gmailMessageId,
      actionType: pendingActions.actionType,
      payload: pendingActions.payload,
      refCode: pendingActions.refCode,
    })
    .from(pendingActions)
    .where(
      and(
        eq(pendingActions.userId, userId),
        eq(pendingActions.gmailMessageId, gmailMessageId),
        eq(pendingActions.actionType, actionType),
        eq(pendingActions.status, "pending"),
      ),
    )
    .limit(1);

  return row ?? null;
}

// Ages out pending actions older than 24 hours so their ref codes stop matching
// inbound Signal replies. Returns the number of rows expired.
export async function expireStalePendingActions() {
  const db = getDb();
  const cutoff = new Date(Date.now() - STALE_PENDING_ACTION_MS);
  const rows = await db
    .update(pendingActions)
    .set({ status: "expired", resolvedAt: new Date() })
    .where(
      and(
        eq(pendingActions.status, "pending"),
        lt(pendingActions.createdAt, cutoff),
      ),
    )
    .returning({ id: pendingActions.id });

  return rows.length;
}

export async function getUserIdsWithPendingActions() {
  const db = getDb();
  const rows = await db
    .selectDistinct({ userId: pendingActions.userId })
    .from(pendingActions)
    .where(eq(pendingActions.status, "pending"));

  return rows.map((row) => row.userId);
}

// Marks a pending action resolved (confirmed/discarded/expired) so its ref code
// stops matching in getPendingActionByRefCode.
export async function resolvePendingAction(
  id: string,
  status: PendingActionStatusValue,
) {
  const db = getDb();
  const [row] = await db
    .update(pendingActions)
    .set({ status, resolvedAt: new Date() })
    .where(eq(pendingActions.id, id))
    .returning({ id: pendingActions.id });

  return row ?? null;
}

// Swaps in a revised draft while keeping the same ref code so the user reuses it.
export async function updatePendingActionPayload(id: string, payload: unknown) {
  const db = getDb();
  const [row] = await db
    .update(pendingActions)
    .set({ payload })
    .where(eq(pendingActions.id, id))
    .returning({ id: pendingActions.id });

  return row ?? null;
}

async function generateUniqueRefCode(userId: string): Promise<string> {
  for (let attempt = 0; attempt < REF_CODE_MAX_ATTEMPTS; attempt += 1) {
    const candidate = generateRefCode();
    const existing = await getPendingActionByRefCode(userId, candidate);

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique ref code.");
}

function generateRefCode(): string {
  let code = "";

  for (let index = 0; index < REF_CODE_LENGTH; index += 1) {
    const position = Math.floor(Math.random() * REF_CODE_ALPHABET.length);
    code += REF_CODE_ALPHABET[position];
  }

  return code;
}
