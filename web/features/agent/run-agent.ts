import { fetchEmailsInTimeWindow, type GmailEmail } from "@/features/gmail/gmail";
import { sendSignalMessage } from "@/features/signal/signal";
import { summariseEmail } from "@/features/ai/summarise";
import {
    saveAgentRun,
    updateIntegrationLastRunTimestamp,
} from "@/db/queries";

const EMAIL_PROCESS_DELAY_MS = 500;

export type AgentRunSummary = {
    emailsFound: number;
    summariesSent: number;
    status: "success" | "error";
};

type ProcessEmailResult = {
    summarySent: boolean;
};

export async function runAgent(userId: string): Promise<AgentRunSummary> {
    const windowEnd = new Date();

    try {
        console.log(`[CRON] Starting agent run for userId: ${userId}`);

        const emails = await fetchEmailsInTimeWindow(userId, windowEnd);
        console.log(
            `[GMAIL] Found ${emails.length} emails in current sync window`,
        );

        const { summary } = await processEmails(userId, emails);
        await saveRunResult(userId, summary);
        logRunComplete(summary.summariesSent);

        return summary;
    } catch (error) {
        const message = getErrorMessage(error);
        console.error(`[CRON] Agent run failed for userId: ${userId}`);
        console.error(error);

        const result = buildErrorResult();
        await saveRunResult(userId, result, message);

        return result;
    } finally {
        await persistLastRunTimestamp(userId, windowEnd);
    }
}

async function processEmails(
    userId: string,
    emails: GmailEmail[],
): Promise<{ summary: AgentRunSummary }> {
    let summariesSent = 0;

    for (const [index, email] of emails.entries()) {
        const result = await processEmail(userId, email);

        if (result.summarySent) {
            summariesSent += 1;
        }

        if (index < emails.length - 1) {
            await delay(EMAIL_PROCESS_DELAY_MS);
        }
    }

    return {
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
            summarySent: false,
        };
    }

    const signalResult = await sendSignalMessage(
        summary,
        email.subject,
        userId,
    );

    if (!signalResult.ok) {
        console.error(
            `[SIGNAL] Failed to send summary for: ${email.subject} (${signalResult.error || "Unknown error"})`,
        );

        return {
            summarySent: false,
        };
    }

    console.log(`[SIGNAL] Sent summary for: ${email.subject}`);

    return {
        summarySent: signalResult.ok,
    };
}

async function persistLastRunTimestamp(userId: string, lastRunTimestamp: Date) {
    try {
        await updateIntegrationLastRunTimestamp(userId, lastRunTimestamp);
    } catch (error) {
        console.error(
            `[CRON] Failed to persist last_run_timestamp for userId: ${userId}`,
        );
        console.error(error);
    }
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
        console.error(
            `[CRON] Failed to persist agent run for userId: ${userId}`,
        );
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

function logRunComplete(summariesSent: number) {
    console.log(`[CRON] Run complete - ${summariesSent} summaries sent`);
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown agent run error.";
}

function delay(durationMs: number) {
    return new Promise((resolve) => setTimeout(resolve, durationMs));
}
