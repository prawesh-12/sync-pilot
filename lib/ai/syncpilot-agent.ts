export const syncPilotWorkflows = [
  "email_triage",
  "calendar_brief",
  "operations_copilot",
] as const;

export type SyncPilotWorkflow = (typeof syncPilotWorkflows)[number];

export type SyncPilotAction = {
  action: string;
  owner: "operator" | "automation" | "customer";
  detail: string;
};

export type SyncPilotAgentResult = {
  headline: string;
  summary: string;
  riskLevel: "low" | "medium" | "high";
  automationReadiness: "ready" | "needs_review" | "blocked";
  confidence: number;
  suggestedTags: string[];
  recommendedActions: SyncPilotAction[];
  missingInformation: string[];
  draftReply: string;
};

export const syncPilotAgentSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "headline",
    "summary",
    "riskLevel",
    "automationReadiness",
    "confidence",
    "suggestedTags",
    "recommendedActions",
    "missingInformation",
    "draftReply",
  ],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    riskLevel: { type: "string", enum: ["low", "medium", "high"] },
    automationReadiness: {
      type: "string",
      enum: ["ready", "needs_review", "blocked"],
    },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    suggestedTags: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
    recommendedActions: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["action", "owner", "detail"],
        properties: {
          action: { type: "string" },
          owner: {
            type: "string",
            enum: ["operator", "automation", "customer"],
          },
          detail: { type: "string" },
        },
      },
    },
    missingInformation: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
    },
    draftReply: { type: "string" },
  },
} as const;

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
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SyncPilotAgentResult>;

  return (
    typeof candidate.headline === "string" &&
    typeof candidate.summary === "string" &&
    typeof candidate.riskLevel === "string" &&
    typeof candidate.automationReadiness === "string" &&
    typeof candidate.confidence === "number" &&
    Array.isArray(candidate.suggestedTags) &&
    Array.isArray(candidate.recommendedActions) &&
    Array.isArray(candidate.missingInformation) &&
    typeof candidate.draftReply === "string"
  );
}
