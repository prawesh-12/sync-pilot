import { generateText, stepCountIs, type LanguageModel } from "ai";
import { type GmailEmail } from "@/features/gmail/gmail";
import { getGroqModel } from "@/features/ai/groq";
import {
  buildTriagePrompt,
  buildTriageUserMessage,
} from "@/features/agent/triage-prompt";
import {
  buildTriageTools,
  createDecisionRecorder,
  type RecordedDecision,
} from "@/features/agent/tools";
import { summariseAndNotify } from "@/features/agent/tools/notify";
import {
  createUsageCollector,
  type TokenUsage,
  type UsageCollector,
} from "@/features/agent/usage";
import type { AgentRunSummary, EmailDecision, ResolvedAccount } from "./types";

const EMAIL_PROCESS_DELAY_MS = 500;
// One-shot triage: force a single tool call, no follow-up model turn.
const TRIAGE_MAX_STEPS = 1;
const DEFAULT_USER_LABEL = "the user";

export async function processEmails(
  account: ResolvedAccount,
  emails: GmailEmail[],
): Promise<{
  summary: AgentRunSummary;
  decisions: EmailDecision[];
  usage: TokenUsage;
}> {
  const systemPrompt = buildTriagePrompt(
    account.emailAddress || DEFAULT_USER_LABEL,
    new Date().toISOString(),
  );
  const model = getGroqModel();
  const decisions: EmailDecision[] = [];
  const collector = createUsageCollector();

  for (const [index, email] of emails.entries()) {
    const decision = await triageEmail(
      model,
      systemPrompt,
      account,
      email,
      collector,
    );
    decisions.push(decision);

    if (index < emails.length - 1) {
      await delay(EMAIL_PROCESS_DELAY_MS);
    }
  }

  const usage = collector.snapshot();

  return {
    summary: buildRunSummary(emails.length, decisions, usage),
    decisions,
    usage,
  };
}

function buildRunSummary(
  emailsFound: number,
  decisions: EmailDecision[],
  usage: TokenUsage,
): AgentRunSummary {
  return {
    emailsFound,
    summariesSent: decisions.filter((entry) => entry.notified).length,
    status: "success",
    totalTokens: usage.totalTokens,
  };
}

async function triageEmail(
  model: LanguageModel,
  systemPrompt: string,
  account: ResolvedAccount,
  email: GmailEmail,
  collector: UsageCollector,
): Promise<EmailDecision> {
  const recorder = createDecisionRecorder();
  await runTriageModel(
    model,
    systemPrompt,
    account,
    email,
    recorder.record,
    collector,
  );

  const recorded = recorder.get();

  if (recorded) {
    return buildDecision(email, recorded);
  }

  // Model picked no tool (error or empty turn) — never drop the email.
  return fallbackToSummary(account.userId, email, collector);
}

async function runTriageModel(
  model: LanguageModel,
  systemPrompt: string,
  account: ResolvedAccount,
  email: GmailEmail,
  record: (decision: RecordedDecision) => void,
  collector: UsageCollector,
) {
  const tools = buildTriageTools({
    email,
    userId: account.userId,
    connectedAccountId: account.connectedAccountId,
    record,
    recordUsage: (usage) => collector.add(usage),
  });

  try {
    console.log(`[AGENT] Triaging: ${email.subject}`);

    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: buildTriageUserMessage(email),
      tools,
      toolChoice: "required",
      stopWhen: stepCountIs(TRIAGE_MAX_STEPS),
    });
    collector.add(result.usage);
  } catch (error) {
    console.error(
      `[AGENT] Triage failed for userId: ${account.userId}, email: ${email.subject}`,
    );
    console.error(error);
  }
}

function buildDecision(
  email: GmailEmail,
  recorded: RecordedDecision,
): EmailDecision {
  return {
    gmailMessageId: email.messageId,
    subject: email.subject,
    decision: recorded.decision,
    reasoning: recorded.reasoning,
    toolCalls: recorded.toolCall,
    notified: recorded.notified,
  };
}

async function fallbackToSummary(
  userId: string,
  email: GmailEmail,
  collector: UsageCollector,
): Promise<EmailDecision> {
  const { notified, usage } = await summariseAndNotify(email, userId);
  collector.add(usage);

  return {
    gmailMessageId: email.messageId,
    subject: email.subject,
    decision: "summarize_notify",
    reasoning: "Triage produced no decision; defaulted to summary.",
    toolCalls: { name: "summarizeAndNotify", args: {}, fallback: true },
    notified,
  };
}

function delay(durationMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
