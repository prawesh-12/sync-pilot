import type { GmailEmail } from "@/features/gmail/gmail";

// Subset of the schema's DecisionValue union covered by Phase 2 tools.
export type DecisionName = "ignore" | "summarize_notify" | "escalate";

export type RecordedDecision = {
  decision: DecisionName;
  reasoning: string;
  notified: boolean;
  toolCall: {
    name: string;
    args: Record<string, unknown>;
  };
};

export type TriageToolContext = {
  email: GmailEmail;
  userId: string;
  // Tool calls this once; the recorder keeps only the first to enforce one decision.
  record: (decision: RecordedDecision) => void;
};
