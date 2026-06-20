import { getPendingActionByRefCode } from "@/db/queries";
import { scopedLogger } from "@/lib/logger";

const log = scopedLogger("SIGNAL");

const REF_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const REF_CODE_LENGTH = 4;
const SEND_KEYWORDS = new Set(["send", "yes"]);
const DISCARD_KEYWORDS = new Set(["no", "discard"]);

export type PendingAction = NonNullable<
  Awaited<ReturnType<typeof getPendingActionByRefCode>>
>;

// What an inbound Signal message resolves to once matched against open actions.
export type ParsedReply =
  | { kind: "draft_send"; pending: PendingAction }
  | { kind: "draft_discard"; pending: PendingAction }
  | { kind: "draft_revise"; pending: PendingAction; instructions: string }
  | { kind: "ref_usage"; refCode: string }
  | { kind: "freeform"; text: string };

type ParseReplyInput = {
  message: string;
  userId: string;
};

// Tries to match the leading ref code against a pending action; anything that
// does not match a known code is treated as a freeform command.
export async function parseReply(input: ParseReplyInput): Promise<ParsedReply> {
  const text = input.message.trim();
  const refCode = extractRefCode(text);

  if (!refCode) {
    log.info("reply did not start with a valid ref code");
    return { kind: "freeform", text };
  }

  const pending = await getPendingActionByRefCode(input.userId, refCode);

  if (!pending) {
    log.info({ refCode }, "no pending action found for ref code");
    return { kind: "freeform", text };
  }

  return classifyCommand(pending, stripRefCode(text));
}

export function classifyCommand(
  pending: PendingAction,
  command: string,
): ParsedReply {
  const normalized = command.trim().toLowerCase();

  if (!normalized) {
    return { kind: "ref_usage", refCode: pending.refCode };
  }

  if (SEND_KEYWORDS.has(normalized)) {
    return { kind: "draft_send", pending };
  }

  if (DISCARD_KEYWORDS.has(normalized)) {
    return { kind: "draft_discard", pending };
  }

  return { kind: "draft_revise", pending, instructions: command.trim() };
}

export function extractRefCode(text: string): string | null {
  const candidate = text.split(/\s+/)[0]?.toUpperCase() ?? "";

  if (candidate.length !== REF_CODE_LENGTH) {
    return null;
  }

  const isRefCode = [...candidate].every((char) =>
    REF_CODE_ALPHABET.includes(char),
  );

  return isRefCode ? candidate : null;
}

export function stripRefCode(text: string): string {
  const firstSpace = text.search(/\s/);

  return firstSpace === -1 ? "" : text.slice(firstSpace + 1);
}
