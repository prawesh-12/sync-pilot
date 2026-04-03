import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createTextCompletion } from "@/lib/ai/groq";
import {
  buildSyncPilotSystemPrompt,
  buildSyncPilotUserPrompt,
  isSyncPilotWorkflow,
  syncPilotAgentResultSchema,
  type SyncPilotAgentResult,
  type SyncPilotWorkflow,
} from "@/lib/ai/syncpilot-agent";

type AgentRunRequest = {
  workflow?: unknown;
  task?: unknown;
  context?: unknown;
};

function parseRequestBody(body: AgentRunRequest) {
  const workflow: SyncPilotWorkflow = isSyncPilotWorkflow(body.workflow)
    ? body.workflow
    : "operations_copilot";
  const task = typeof body.task === "string" ? body.task.trim() : "";
  const context = typeof body.context === "string" ? body.context.trim() : "";

  return { workflow, task, context };
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as AgentRunRequest;
    const { workflow, task, context } = parseRequestBody(body);

    if (task.length < 12) {
      return NextResponse.json(
        { error: "Task must be at least 12 characters long." },
        { status: 400 },
      );
    }

    if (task.length > 4000 || context.length > 12000) {
      return NextResponse.json(
        { error: "Task or context is too large for a single run." },
        { status: 400 },
      );
    }

    const completion = await createTextCompletion({
      system: buildSyncPilotSystemPrompt(workflow),
      prompt: buildSyncPilotUserPrompt({ workflow, task, context }),
      maxOutputTokens: 500,
    });
    const parsed = await parseAgentResult(completion.text, { task, context });

    return NextResponse.json({
      result: parsed,
      usage: completion.usage,
      workflow,
      provider: "groq",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Agent execution failed.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}

async function parseAgentResult(
  text: string,
  fallbackInput: { task: string; context: string },
) {
  const parsed = tryParseAgentResult(text);

  if (parsed) {
    return parsed;
  }

  const repairedText = await repairAgentResult(text);
  const repaired = tryParseAgentResult(repairedText);

  if (repaired) {
    return repaired;
  }

  return buildFallbackAgentResult(fallbackInput);
}

function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    return "";
  }

  return text.slice(start, end + 1);
}

function tryParseAgentResult(text: string) {
  const jsonCandidate = extractJsonObject(text);

  if (!jsonCandidate) {
    return null;
  }

  try {
    const parsedJson = JSON.parse(jsonCandidate) as unknown;
    const normalizedResult = normalizeAgentResult(parsedJson);
    const parsedResult = syncPilotAgentResultSchema.safeParse(normalizedResult);

    return parsedResult.success ? parsedResult.data : null;
  } catch {
    return null;
  }
}

async function repairAgentResult(text: string) {
  const completion = await createTextCompletion({
    system: [
      "You repair malformed JSON.",
      "Return exactly one valid JSON object.",
      "Do not add markdown fences or commentary.",
      "Preserve the original meaning while fixing syntax and schema issues.",
      'The JSON must include headline, summary, riskLevel, automationReadiness, confidence, suggestedTags, recommendedActions, missingInformation, and draftReply.',
      'riskLevel must be "low", "medium", or "high".',
      'automationReadiness must be "ready", "needs_review", or "blocked".',
      'confidence must be an integer from 0 to 100.',
      'recommendedActions must be an array of objects with action, owner, and detail. owner must be "operator", "automation", or "customer".',
    ].join(" "),
    prompt: `Repair this into valid JSON only:\n\n${text}`,
    maxOutputTokens: 500,
    temperature: 0,
  });

  return completion.text;
}

function normalizeAgentResult(value: unknown): SyncPilotAgentResult {
  const candidate = value && typeof value === "object" ? value : {};
  const record = candidate as Record<string, unknown>;
  const summary = getText(record.summary);
  const headline = getText(record.headline) || getHeadlineFromSummary(summary);

  return {
    headline,
    summary,
    riskLevel: normalizeRiskLevel(record.riskLevel),
    automationReadiness: normalizeAutomationReadiness(record.automationReadiness),
    confidence: normalizeConfidence(record.confidence),
    suggestedTags: normalizeStringList(record.suggestedTags, 6),
    recommendedActions: normalizeActions(record.recommendedActions, summary),
    missingInformation: normalizeStringList(record.missingInformation, 5),
    draftReply: getText(record.draftReply) || "Thanks. I reviewed this and will follow up shortly.",
  };
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getHeadlineFromSummary(summary: string) {
  if (!summary) {
    return "Review required";
  }

  return summary.split(/[.!?]/, 1)[0]?.trim() || "Review required";
}

function normalizeRiskLevel(value: unknown): SyncPilotAgentResult["riskLevel"] {
  const normalized = getText(value).toLowerCase();

  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }

  if (
    normalized.includes("urgent") ||
    normalized.includes("critical") ||
    normalized.includes("severe")
  ) {
    return "high";
  }

  if (normalized.includes("minor") || normalized.includes("small")) {
    return "low";
  }

  return "medium";
}

function normalizeAutomationReadiness(
  value: unknown,
): SyncPilotAgentResult["automationReadiness"] {
  const normalized = getText(value).toLowerCase();

  if (
    normalized === "ready" ||
    normalized === "needs_review" ||
    normalized === "blocked"
  ) {
    return normalized;
  }

  if (
    normalized.includes("review") ||
    normalized.includes("human") ||
    normalized.includes("manual")
  ) {
    return "needs_review";
  }

  if (
    normalized.includes("block") ||
    normalized.includes("wait") ||
    normalized.includes("missing")
  ) {
    return "blocked";
  }

  return "ready";
}

function normalizeConfidence(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  if (Number.isNaN(numericValue)) {
    return 70;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function normalizeStringList(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(getText)
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeActions(value: unknown, summary: string) {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        action: "Review the situation",
        owner: "operator" as const,
        detail: summary || "Review the provided context and decide the next step.",
      },
    ];
  }

  const actions = value
    .map((item) => normalizeAction(item))
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .slice(0, 5);

  if (actions.length > 0) {
    return actions;
  }

  return [
    {
      action: "Review the situation",
      owner: "operator" as const,
      detail: summary || "Review the provided context and decide the next step.",
    },
  ];
}

function normalizeAction(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const action = getText(record.action) || getText(record.title) || "Follow up";
  const detail =
    getText(record.detail) ||
    getText(record.description) ||
    "Carry out the recommended next step.";

  return {
    action,
    owner: normalizeActionOwner(record.owner),
    detail,
  };
}

function normalizeActionOwner(
  value: unknown,
): SyncPilotAgentResult["recommendedActions"][number]["owner"] {
  const normalized = getText(value).toLowerCase();

  if (normalized === "operator" || normalized === "automation" || normalized === "customer") {
    return normalized;
  }

  if (
    normalized.includes("auto") ||
    normalized.includes("system") ||
    normalized.includes("bot")
  ) {
    return "automation";
  }

  if (
    normalized.includes("customer") ||
    normalized.includes("client") ||
    normalized.includes("vendor")
  ) {
    return "customer";
  }

  return "operator";
}

function buildFallbackAgentResult(input: {
  task: string;
  context: string;
}): SyncPilotAgentResult {
  const contextSummary = summarizeFallbackContext(input.context);
  const summary =
    contextSummary ||
    "Review the provided context, confirm the missing details, and decide the safest next step.";
  const headline = contextSummary
    ? getHeadlineFromSummary(contextSummary)
    : "Manual review required";

  return {
    headline,
    summary,
    riskLevel: "medium",
    automationReadiness: "needs_review",
    confidence: 55,
    suggestedTags: [],
    recommendedActions: [
      {
        action: "Review and respond",
        owner: "operator",
        detail: "Review the situation, confirm the missing details, and send the next response.",
      },
    ],
    missingInformation: [],
    draftReply: "Thanks for the update. I reviewed this and will follow up shortly.",
  };
}

function summarizeFallbackContext(context: string) {
  const cleaned = context
    .replace(/\s+/g, " ")
    .replace(/\b(Sender|Thread summary|Constraints):/gi, "")
    .trim();

  if (!cleaned) {
    return "";
  }

  return cleaned.slice(0, 320).trim();
}
