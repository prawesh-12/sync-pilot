import { generateText, stepCountIs, type LanguageModel } from "ai";
import { type GmailEmail } from "@/features/gmail/gmail";
import {
  getGroqModel,
  GROQ_MAX_RETRIES,
  GROQ_TIMEOUT_MS,
} from "@/features/ai/groq";
import {
  buildTriagePrompt,
  buildTriageUserMessage,
} from "@/features/agent/triage-prompt";
import { buildFeedbackDigest } from "@/features/agent/feedback-digest";
import {
  buildTriageTools,
  createDecisionRecorder,
  type RecordedDecision,
} from "@/features/agent/tools";
import { summariseAndNotify } from "@/features/agent/tools/notify";
import {
  claimEmailForProcessing,
  markEmailHandledIfAbsent,
  markEmailNotified,
} from "@/db/queries";
import {
  createUsageCollector,
  type TokenUsage,
  type UsageCollector,
} from "@/features/agent/usage";
import { scopedLogger } from "@/lib/logger";
import type { AgentRunSummary, EmailDecision, ResolvedAccount } from "./types";

const log = scopedLogger("AGENT");

const EMAIL_PROCESS_DELAY_MS = 500;
// One-shot triage: force a single tool call, no follow-up model turn.
const TRIAGE_MAX_STEPS = 1;
const DEFAULT_USER_LABEL = "the user";
// These tools persist their own processed_emails status (with snooze timer or
// draft id); the rest are marked "notified" so they are not re-triaged.
const SELF_PERSISTING_DECISIONS = new Set(["archive", "snooze", "draft_reply"]);

export async function processEmails(
  account: ResolvedAccount,
  emails: GmailEmail[],
): Promise<{
  summary: AgentRunSummary;
  decisions: EmailDecision[];
  usage: TokenUsage;
}> {
  const feedbackDigest = await buildFeedbackDigest(account.userId);
  const systemPrompt = buildTriagePrompt(
    account.emailAddress || DEFAULT_USER_LABEL,
    new Date().toISOString(),
    feedbackDigest,
  );
  const model = getGroqModel();
  const decisions: EmailDecision[] = [];
  const collector = createUsageCollector();
  let claimed = 0;

  for (const [index, email] of emails.entries()) {
    // Claim before triaging so exactly one run notifies on this email; a
    // concurrent run that lost the claim skips it (no duplicate summary).
    const won = await claimEmailForProcessing(account.userId, email.messageId);

    if (!won) {
      log.info({ subject: email.subject }, "skipping already-claimed email");
      continue;
    }

    claimed += 1;
    const decision = await triageEmail(
      model,
      systemPrompt,
      account,
      email,
      collector,
    );
    await recordHandled(account.userId, email.messageId, decision);
    decisions.push(decision);

    if (index < emails.length - 1) {
      await delay(EMAIL_PROCESS_DELAY_MS);
    }
  }

  const usage = collector.snapshot();

  return {
    summary: buildRunSummary(claimed, decisions, usage),
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
    log.info({ subject: email.subject }, "triaging email");

    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: buildTriageUserMessage(email),
      tools,
      toolChoice: "required",
      stopWhen: stepCountIs(TRIAGE_MAX_STEPS),
      // Bounded so one stalled triage can't consume the run; a failure here is
      // caught below and falls back to a summary.
      abortSignal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
      maxRetries: GROQ_MAX_RETRIES,
    });
    collector.add(result.usage);
  } catch (error) {
    log.error(
      { userId: account.userId, subject: email.subject, err: error },
      "triage failed",
    );
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

// Marks an email handled unless its tool already wrote a processed_emails row.
// A self-persisting tool only writes that row on success, so if it FAILED we
// still record the email here — otherwise it stays unrecorded and the next run
// re-triages it, re-sending its summary/notification (duplicate mail). The
// failure backstop is non-clobbering so it can't overwrite a row the tool did
// manage to write (e.g. a draft that was saved but whose Signal send failed).
export async function recordHandled(userId: string, messageId: string, decision: EmailDecision) {
  const selfPersisting = SELF_PERSISTING_DECISIONS.has(decision.decision);

  if (selfPersisting && !toolDidFail(decision)) {
    return;
  }

  try {
    if (selfPersisting) {
      await markEmailHandledIfAbsent(userId, messageId);
    } else {
      await markEmailNotified(userId, messageId);
    }
  } catch (error) {
    log.error(
      { userId, messageId, err: error },
      "failed to mark email handled",
    );
  }
}

// Tools flag a failed run via toolCall.args.failed; on failure they skip their
// own processed_emails write, so the email needs the "notified" backstop.
export function toolDidFail(decision: EmailDecision): boolean {
  const args = (decision.toolCalls as { args?: { failed?: unknown } } | null)?.args;

  return args?.failed === true;
}

function delay(durationMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
