import { executeGmailTool } from "@/lib/composio";
import { resolveLabelId } from "@/features/gmail/gmail-labels";
import type { GmailActionAccount } from "@/features/gmail/gmail";

const GMAIL_MODIFY_LABELS_TOOL = "GMAIL_ADD_LABEL_TO_EMAIL";
const INBOX_LABEL_ID = "INBOX";

type LabelChange = {
  addLabelIds?: string[];
  removeLabelIds?: string[];
};

// Gmail archive is just dropping the INBOX label from the message.
export async function archiveEmail(
  account: GmailActionAccount,
  messageId: string,
) {
  return modifyEmailLabels(account, messageId, {
    removeLabelIds: [INBOX_LABEL_ID],
  });
}

export async function applyLabelToEmail(
  account: GmailActionAccount,
  messageId: string,
  labelName: string,
) {
  const labelId = await resolveLabelId(account, labelName);

  return modifyEmailLabels(account, messageId, { addLabelIds: [labelId] });
}

async function modifyEmailLabels(
  account: GmailActionAccount,
  messageId: string,
  change: LabelChange,
) {
  return executeGmailTool(
    account.userId,
    GMAIL_MODIFY_LABELS_TOOL,
    {
      message_id: messageId,
      ...(change.addLabelIds ? { add_label_ids: change.addLabelIds } : {}),
      ...(change.removeLabelIds
        ? { remove_label_ids: change.removeLabelIds }
        : {}),
    },
    account.connectedAccountId,
  );
}
