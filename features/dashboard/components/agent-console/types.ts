import type {
  SyncPilotAgentResult,
  SyncPilotWorkflow,
} from "@/features/ai/syncpilot-agent";

export type AgentRunRecord = {
  id: string;
  workflow: SyncPilotWorkflow;
  task: string;
  context: string;
  result: SyncPilotAgentResult;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
};
