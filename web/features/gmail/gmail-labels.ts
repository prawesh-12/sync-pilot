import { executeGmailTool } from "@/lib/composio";
import { findArray, findString, readString } from "@/features/gmail/parse";
import type { GmailActionAccount } from "@/features/gmail/gmail";

const GMAIL_LIST_LABELS_TOOL = "GMAIL_LIST_LABELS";
const GMAIL_CREATE_LABEL_TOOL = "GMAIL_CREATE_LABEL";
const LABEL_ARRAY_KEYS = ["labels", "items", "data"];

// Stable name->id mapping per user; avoids repeat Composio calls in a process.
const labelIdCacheByUser = new Map<string, Map<string, string>>();

export async function resolveLabelId(
  account: GmailActionAccount,
  labelName: string,
): Promise<string> {
  const normalized = labelName.trim();
  const cached = getCachedLabelId(account.userId, normalized);

  if (cached) {
    return cached;
  }

  const existing = await findExistingLabelId(account, normalized);
  const labelId = existing ?? (await createLabel(account, normalized));
  cacheLabelId(account.userId, normalized, labelId);

  return labelId;
}

async function findExistingLabelId(
  account: GmailActionAccount,
  labelName: string,
): Promise<string | null> {
  const result = await executeGmailTool(
    account.userId,
    GMAIL_LIST_LABELS_TOOL,
    {},
    account.connectedAccountId,
  );
  const labels = findArray(result.data, LABEL_ARRAY_KEYS);
  const target = labelName.toLowerCase();

  for (const entry of labels) {
    const label = toLabel(entry);

    if (label && label.name.toLowerCase() === target) {
      return label.id;
    }
  }

  return null;
}

async function createLabel(
  account: GmailActionAccount,
  labelName: string,
): Promise<string> {
  const result = await executeGmailTool(
    account.userId,
    GMAIL_CREATE_LABEL_TOOL,
    { label_name: labelName },
    account.connectedAccountId,
  );
  const labelId = findString(result.data, ["id"]);

  if (!labelId) {
    throw new Error(`Gmail did not return an id for label "${labelName}".`);
  }

  return labelId;
}

function toLabel(entry: unknown): { id: string; name: string } | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const record = entry as Record<string, unknown>;
  const id = readString(record, ["id"]);
  const name = readString(record, ["name"]);

  if (!id || !name) {
    return null;
  }

  return { id, name };
}

function getCachedLabelId(userId: string, labelName: string) {
  return labelIdCacheByUser.get(userId)?.get(labelName) ?? null;
}

function cacheLabelId(userId: string, labelName: string, labelId: string) {
  const userCache = labelIdCacheByUser.get(userId) ?? new Map();
  userCache.set(labelName, labelId);
  labelIdCacheByUser.set(userId, userCache);
}
