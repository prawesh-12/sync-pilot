import { z } from "zod";

export const syncPilotWorkflows = [
  "email_triage",
  "calendar_brief",
  "operations_copilot",
] as const;

export type SyncPilotWorkflow = (typeof syncPilotWorkflows)[number];

export const syncPilotActionSchema = z.object({
  action: z.string(),
  owner: z.enum(["operator", "automation", "customer"]),
  detail: z.string(),
});

export const syncPilotAgentResultSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  automationReadiness: z.enum(["ready", "needs_review", "blocked"]),
  confidence: z.number().int().min(0).max(100),
  suggestedTags: z.array(z.string()).max(6),
  recommendedActions: z.array(syncPilotActionSchema).min(1).max(5),
  missingInformation: z.array(z.string()).max(5),
  draftReply: z.string(),
});

export type SyncPilotAction = z.infer<typeof syncPilotActionSchema>;
export type SyncPilotAgentResult = z.infer<typeof syncPilotAgentResultSchema>;

const workflowInstructions: Record<SyncPilotWorkflow, string> = {
  email_triage:
    "Prioritize sender intent, urgency, reply posture, and safe next actions for inbox handling.",
  calendar_brief:
    "Focus on scheduling conflicts, blockers, decision owners, and the cleanest follow-up sequence.",
  operations_copilot:
    "Act as a general operations copilot for a founder or operator. Optimize for concise execution steps and review boundaries.",
};

export function buildSyncPilotSystemPrompt(workflow: SyncPilotWorkflow) {
  return [
    "You are SyncPilot, an operations agent for a small team running email, scheduling, and execution workflows.",
    workflowInstructions[workflow],
    "Respond with exactly one valid JSON object and no surrounding markdown or commentary.",
    "The JSON object must include headline, summary, riskLevel, automationReadiness, confidence, suggestedTags, recommendedActions, missingInformation, and draftReply.",
    'riskLevel must be one of: "low", "medium", "high".',
    'automationReadiness must be one of: "ready", "needs_review", "blocked".',
    'Each recommended action must include action, owner, and detail. owner must be "operator", "automation", or "customer".',
    "confidence must be an integer from 0 to 100.",
    "Return only data that can be defended from the provided input.",
    "If key facts are missing, call them out in missingInformation and lower automationReadiness.",
    "Keep draftReply professional, short, and safe to send after human review.",
  ].join(" ");
}

export function buildSyncPilotUserPrompt(input: {
  workflow: SyncPilotWorkflow;
  task: string;
  context: string;
}) {
  return [
    `Workflow: ${input.workflow}`,
    `Task:\n${input.task}`,
    `Context:\n${input.context || "No additional context provided."}`,
  ].join("\n\n");
}

export function isSyncPilotWorkflow(value: unknown): value is SyncPilotWorkflow {
  return typeof value === "string" && syncPilotWorkflows.includes(value as SyncPilotWorkflow);
}

export function isSyncPilotAgentResult(
  value: unknown,
): value is SyncPilotAgentResult {
  return syncPilotAgentResultSchema.safeParse(value).success;
}
