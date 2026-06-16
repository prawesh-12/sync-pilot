import { generateText, stepCountIs, type LanguageModel } from "ai";
import { fetchEmailsInTimeWindow, type GmailEmail } from "@/features/gmail/gmail";
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
    getGmailAccountById,
    saveAgentDecisions,
    saveAgentRun,
    updateGmailAccountLastRun,
} from "@/db/queries";
import type { DecisionValue } from "@/db/schema";

const EMAIL_PROCESS_DELAY_MS = 500;
// One-shot triage: force a single tool call, no follow-up model turn.
const TRIAGE_MAX_STEPS = 1;
const DEFAULT_USER_LABEL = "the user";

export type AgentRunSummary = {
    emailsFound: number;
    summariesSent: number;
    status: "success" | "error";
};

type EmailDecision = {
    gmailMessageId: string;
    decision: DecisionValue;
    reasoning: string;
    toolCalls: unknown;
    notified: boolean;
};

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
    const emails = await fetchEmailsInTimeWindow(account, windowEnd);
    console.log(`[GMAIL] Found ${emails.length} emails in current sync window`);

    const { summary, decisions } = await processEmails(
        userId,
        account.emailAddress,
        emails,
    );
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

async function resolveGmailAccount(userId: string, integrationId: string) {
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

async function processEmails(
    userId: string,
    emailAddress: string | null,
    emails: GmailEmail[],
): Promise<{ summary: AgentRunSummary; decisions: EmailDecision[] }> {
    const systemPrompt = buildTriagePrompt(emailAddress || DEFAULT_USER_LABEL);
    const model = getGroqModel();
    const decisions: EmailDecision[] = [];

    for (const [index, email] of emails.entries()) {
        const decision = await triageEmail(model, systemPrompt, userId, email);
        decisions.push(decision);

        if (index < emails.length - 1) {
            await delay(EMAIL_PROCESS_DELAY_MS);
        }
    }

    return { summary: buildRunSummary(emails.length, decisions), decisions };
}

function buildRunSummary(
    emailsFound: number,
    decisions: EmailDecision[],
): AgentRunSummary {
    return {
        emailsFound,
        summariesSent: decisions.filter((entry) => entry.notified).length,
        status: "success",
    };
}

async function triageEmail(
    model: LanguageModel,
    systemPrompt: string,
    userId: string,
    email: GmailEmail,
): Promise<EmailDecision> {
    const recorder = createDecisionRecorder();
    await runTriageModel(model, systemPrompt, userId, email, recorder.record);

    const recorded = recorder.get();

    if (recorded) {
        return buildDecision(email, recorded);
    }

    // Model picked no tool (error or empty turn) — never drop the email.
    return fallbackToSummary(userId, email);
}

async function runTriageModel(
    model: LanguageModel,
    systemPrompt: string,
    userId: string,
    email: GmailEmail,
    record: (decision: RecordedDecision) => void,
) {
    const tools = buildTriageTools({ email, userId, record });

    try {
        console.log(`[AGENT] Triaging: ${email.subject}`);

        await generateText({
            model,
            system: systemPrompt,
            prompt: buildTriageUserMessage(email),
            tools,
            toolChoice: "required",
            stopWhen: stepCountIs(TRIAGE_MAX_STEPS),
        });
    } catch (error) {
        console.error(
            `[AGENT] Triage failed for userId: ${userId}, email: ${email.subject}`,
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
        decision: recorded.decision,
        reasoning: recorded.reasoning,
        toolCalls: recorded.toolCall,
        notified: recorded.notified,
    };
}

async function fallbackToSummary(
    userId: string,
    email: GmailEmail,
): Promise<EmailDecision> {
    const notified = await summariseAndNotify(email, userId);

    return {
        gmailMessageId: email.messageId,
        decision: "summarize_notify",
        reasoning: "Triage produced no decision; defaulted to summary.",
        toolCalls: { name: "summarizeAndNotify", args: {}, fallback: true },
        notified,
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

function delay(durationMs: number) {
    return new Promise((resolve) => setTimeout(resolve, durationMs));
}
