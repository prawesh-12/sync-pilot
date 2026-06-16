import { collectEmails } from "@/features/agent/collect-emails";
import { processEmails } from "@/features/agent/triage";
import {
    getGmailAccountById,
    saveAgentDecisions,
    saveAgentRun,
    updateGmailAccountLastRun,
} from "@/db/queries";
import type {
    AgentRunSummary,
    EmailDecision,
    ResolvedAccount,
} from "@/features/agent/types";

export type { AgentRunSummary } from "@/features/agent/types";

export async function runAgent(
    userId: string,
    integrationId: string,
): Promise<AgentRunSummary> {
    const windowEnd = new Date();

    try {
        return await executeAgentRun(userId, integrationId, windowEnd);
    } catch (error) {
        return await handleRunFailure(userId, integrationId, error);
    } finally {
        await persistLastRunTimestamp(integrationId, windowEnd);
    }
}

async function executeAgentRun(
    userId: string,
    integrationId: string,
    windowEnd: Date,
): Promise<AgentRunSummary> {
    console.log(
        `[CRON] Starting agent run for userId: ${userId}, integrationId: ${integrationId}`,
    );

    const account = await resolveGmailAccount(userId, integrationId);
    const emails = await collectEmails(account, windowEnd);
    console.log(`[GMAIL] Processing ${emails.length} emails this run`);

    const { summary, decisions } = await processEmails(account, emails);
    const run = await saveRunResult(userId, summary);

    if (run) {
        await persistDecisions(run.id, userId, decisions);
    }

    console.log(`[CRON] Run complete - ${summary.summariesSent} summaries sent`);

    return summary;
}

async function handleRunFailure(
    userId: string,
    integrationId: string,
    error: unknown,
): Promise<AgentRunSummary> {
    const message = getErrorMessage(error);
    console.error(
        `[CRON] Agent run failed for userId: ${userId}, integrationId: ${integrationId} - ${message}`,
    );
    console.error(error);

    const result = buildErrorResult();
    await saveRunResult(userId, result, message);

    return result;
}

async function resolveGmailAccount(
    userId: string,
    integrationId: string,
): Promise<ResolvedAccount> {
    const account = await getGmailAccountById(integrationId);

    if (!account || account.userId !== userId) {
        throw new Error("Gmail integration not found for this user.");
    }

    if (!account.isActive) {
        throw new Error("Gmail integration is disabled.");
    }

    if (!account.connectedAccountId) {
        throw new Error("Gmail integration is missing a connected account.");
    }

    return {
        userId,
        connectedAccountId: account.connectedAccountId,
        emailAddress: account.emailAddress,
        lastRunTimestamp: account.lastRunTimestamp,
    };
}

async function persistDecisions(
    runId: string,
    userId: string,
    decisions: EmailDecision[],
) {
    if (decisions.length === 0) {
        return;
    }

    try {
        await saveAgentDecisions(
            decisions.map((entry) => ({
                runId,
                userId,
                gmailMessageId: entry.gmailMessageId,
                decision: entry.decision,
                reasoning: entry.reasoning,
                toolCalls: entry.toolCalls,
            })),
        );
    } catch (error) {
        console.error(
            `[CRON] Failed to persist agent decisions for runId: ${runId}`,
        );
        console.error(error);
    }
}

async function persistLastRunTimestamp(
    integrationId: string,
    lastRunTimestamp: Date,
) {
    try {
        await updateGmailAccountLastRun(integrationId, lastRunTimestamp);
    } catch (error) {
        console.error(
            `[CRON] Failed to persist last_run_timestamp for integrationId: ${integrationId}`,
        );
        console.error(error);
    }
}

async function saveRunResult(
    userId: string,
    result: AgentRunSummary,
    errorMessage?: string,
) {
    try {
        return await saveAgentRun(userId, result);
    } catch (error) {
        console.error(
            `[CRON] Failed to persist agent run for userId: ${userId}`,
        );
        console.error(error);

        if (errorMessage) {
            console.error(`[CRON] Original run error: ${errorMessage}`);
        }

        return null;
    }
}

function buildErrorResult(): AgentRunSummary {
    return {
        emailsFound: 0,
        summariesSent: 0,
        status: "error",
    };
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown agent run error.";
}
