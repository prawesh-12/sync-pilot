import { createApplyLabelTool } from "./apply-label";
import { createArchiveEmailTool } from "./archive-email";
import { createDraftReplyTool } from "./draft-reply";
import { createEscalateUrgentTool } from "./escalate-urgent";
import { createIgnoreTool } from "./ignore";
import { createSnoozeEmailTool } from "./snooze-email";
import { createSummarizeNotifyTool } from "./summarize-notify";
import type { RecordedDecision, TriageToolContext } from "./types";

export type { RecordedDecision } from "./types";

// Captures the first decision a tool records for one email.
export function createDecisionRecorder() {
  let decision: RecordedDecision | null = null;

  return {
    record(next: RecordedDecision) {
      if (!decision) {
        decision = next;
      }
    },
    get() {
      return decision;
    },
  };
}

// Per-email tool set; each tool closes over the email so the model only picks one.
export function buildTriageTools(ctx: TriageToolContext) {
  return {
    ignore: createIgnoreTool(ctx),
    summarizeAndNotify: createSummarizeNotifyTool(ctx),
    escalateUrgent: createEscalateUrgentTool(ctx),
    archiveEmail: createArchiveEmailTool(ctx),
    applyLabel: createApplyLabelTool(ctx),
    snoozeEmail: createSnoozeEmailTool(ctx),
    draftReply: createDraftReplyTool(ctx),
  };
}
