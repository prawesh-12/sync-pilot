import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { pendingActions, type PendingActionTypeValue } from "@/db/schema";

const REF_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const REF_CODE_LENGTH = 4;
const REF_CODE_MAX_ATTEMPTS = 10;

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
