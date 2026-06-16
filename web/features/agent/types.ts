import type { DecisionValue } from "@/db/schema";

export type AgentRunSummary = {
  emailsFound: number;
  summariesSent: number;
  status: "success" | "error";
};

// Gmail account context resolved once per run and threaded through the agent.
export type ResolvedAccount = {
  userId: string;
  connectedAccountId: string;
  emailAddress: string | null;
  lastRunTimestamp: Date | null;
};

export type EmailDecision = {
  gmailMessageId: string;
  decision: DecisionValue;
  reasoning: string;
  toolCalls: unknown;
  notified: boolean;
};
