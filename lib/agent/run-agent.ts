import { fetchUnreadEmails, type GmailEmail } from "@/lib/agent/gmail";
import { sendSignalMessage } from "@/lib/agent/signal";
import { summariseEmail } from "@/lib/ai/summarise";
import { markEmailProcessed, saveAgentRun } from "@/lib/db/queries";

const EMAIL_PROCESS_DELAY_MS = 500;

export type AgentRunSummary = {
  emailsFound: number;
  summariesSent: number;
  status: "success" | "error";
};

type ProcessEmailResult = {
  emailProcessed: boolean;
  summarySent: boolean;
};

export async function runAgent(userId: string): Promise<AgentRunSummary> {
  try {
    console.log(`[CRON] Starting agent run for userId: ${userId}`);

    const emails = await fetchUnreadEmails(userId);
    console.log(`[GMAIL] Found ${emails.length} new unread emails`);

    const { processedEmails, summary } = await processEmails(userId, emails);
    await saveRunResult(userId, summary);
    logRunComplete(processedEmails);

    return summary;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error(`[CRON] Agent run failed for userId: ${userId}`);
    console.error(error);

    const result = buildErrorResult();
    await saveRunResult(userId, result, message);

    return result;
  }
}

async function processEmails(
  userId: string,
  emails: GmailEmail[],
): Promise<{ processedEmails: number; summary: AgentRunSummary }> {
  let processedEmails = 0;
  let summariesSent = 0;

  for (const [index, email] of emails.entries()) {
    const result = await processEmail(userId, email);

    if (result.emailProcessed) {
      processedEmails += 1;
    }

    if (result.summarySent) {
      summariesSent += 1;
    }

    if (index < emails.length - 1) {
      await delay(EMAIL_PROCESS_DELAY_MS);
    }
  }

  return {
    processedEmails,
    summary: {
      emailsFound: emails.length,
      summariesSent,
      status: "success",
    },
  };
}

async function processEmail(
  userId: string,
  email: GmailEmail,
): Promise<ProcessEmailResult> {
  const summary = await summariseEmailWithLogging(email);

  if (!summary) {
    return {
      emailProcessed: false,
      summarySent: false,
    };
  }

  const signalResult = await sendSignalMessage(summary, email.subject);
  await markEmailProcessed(email.messageId, userId);

  if (!signalResult.ok) {
    console.error(
      `[SIGNAL] Failed to send summary for: ${email.subject} (${signalResult.error || "Unknown error"})`,
    );

    return {
      emailProcessed: true,
      summarySent: false,
    };
  }

  console.log(`[SIGNAL] Sent summary for: ${email.subject}`);

  return {
    emailProcessed: true,
    summarySent: signalResult.ok,
  };
}

async function summariseEmailWithLogging(email: GmailEmail) {
  try {
    console.log(`[AI] Summarising email: ${email.subject}`);

    return await summariseEmail(email);
  } catch (error) {
    console.error(`[AI] Failed to summarise email: ${email.subject}`);
    console.error(error);

    return "";
  }
}

async function saveRunResult(
  userId: string,
  result: AgentRunSummary,
  errorMessage?: string,
) {
  try {
    await saveAgentRun(userId, result);
  } catch (error) {
    console.error(`[CRON] Failed to persist agent run for userId: ${userId}`);
    console.error(error);

    if (errorMessage) {
      console.error(`[CRON] Original run error: ${errorMessage}`);
    }
  }
}

function buildErrorResult(): AgentRunSummary {
  return {
    emailsFound: 0,
    summariesSent: 0,
    status: "error",
  };
}

function logRunComplete(processedEmails: number) {
  console.log(`[CRON] Run complete - ${processedEmails} emails processed`);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown agent run error.";
}

function delay(durationMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
