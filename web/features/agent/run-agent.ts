import { collectEmails } from "@/features/agent/collect-emails";
import { processEmails } from "@/features/agent/triage";
import {
    EMPTY_TOKEN_USAGE,
    getUsageMonth,
    type TokenUsage,
} from "@/features/agent/usage";
import {
    addUserUsage,
    getGmailAccountById,
    saveAgentDecisions,
    saveAgentRun,
    updateGmailAccountLastRun,
} from "@/db/queries";
import { scopedLogger } from "@/lib/logger";
import type {
    AgentRunSummary,
    EmailDecision,
    ResolvedAccount,
} from "@/features/agent/types";

export type { AgentRunSummary } from "@/features/agent/types";

const log = scopedLogger("CRON");

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
    log.info({ userId, integrationId }, "starting agent run");

    const account = await resolveGmailAccount(userId, integrationId);
    const emails = await collectEmails(account, windowEnd);
    log.info({ count: emails.length }, "processing emails this run");

    const { summary, decisions, usage } = await processEmails(account, emails);
    const run = await saveRunResult(userId, summary, usage);

    if (run) {
        await persistDecisions(run.id, userId, decisions);
    }

    await persistUserUsage(userId, windowEnd, usage, summary.emailsFound);

    log.info({ summariesSent: summary.summariesSent }, "run complete");

    return summary;
}

async function handleRunFailure(
    userId: string,
    integrationId: string,
    error: unknown,
): Promise<AgentRunSummary> {
    const message = getErrorMessage(error);
    log.error(
        { userId, integrationId, err: error },
        "agent run failed",
    );

    const result = buildErrorResult();
    await saveRunResult(userId, result, EMPTY_TOKEN_USAGE, message);

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
                subject: entry.subject,
                decision: entry.decision,
                reasoning: entry.reasoning,
                toolCalls: entry.toolCalls,
            })),
        );
    } catch (error) {
        log.error({ runId, err: error }, "failed to persist agent decisions");
    }
}

async function persistUserUsage(
    userId: string,
    ranAt: Date,
    usage: TokenUsage,
    emailCount: number,
) {
    if (usage.totalTokens === 0 && emailCount === 0) {
        return;
    }

    try {
        await addUserUsage(
            userId,
            getUsageMonth(ranAt),
            usage.totalTokens,
            emailCount,
        );
    } catch (error) {
        log.error({ userId, err: error }, "failed to persist user usage");
    }
}

async function persistLastRunTimestamp(
    integrationId: string,
    lastRunTimestamp: Date,
) {
    try {
        await updateGmailAccountLastRun(integrationId, lastRunTimestamp);
    } catch (error) {
        log.error(
            { integrationId, err: error },
            "failed to persist last_run_timestamp",
        );
    }
}

async function saveRunResult(
    userId: string,
    result: AgentRunSummary,
    usage: TokenUsage,
    errorMessage?: string,
) {
    try {
        return await saveAgentRun(userId, result, usage);
    } catch (error) {
        log.error(
            { userId, err: error, originalError: errorMessage },
            "failed to persist agent run",
        );

        return null;
    }
}

function buildErrorResult(): AgentRunSummary {
    return {
        emailsFound: 0,
        summariesSent: 0,
        status: "error",
        totalTokens: 0,
    };
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown agent run error.";
}
