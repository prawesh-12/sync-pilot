import type { LanguageModelUsage } from "ai";
import type { GmailEmail } from "@/features/gmail/gmail";

// Mirrors the schema's DecisionValue union for the actions the agent can take.
export type DecisionName =
  | "ignore"
  | "summarize_notify"
  | "escalate"
  | "archive"
  | "apply_label"
  | "snooze"
  | "draft_reply";

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
  connectedAccountId: string;
  // Tool calls this once; the recorder keeps only the first to enforce one decision.
  record: (decision: RecordedDecision) => void;
  // Tools that make their own Groq call report its usage here for accounting.
  recordUsage: (usage: LanguageModelUsage | undefined) => void;
};
