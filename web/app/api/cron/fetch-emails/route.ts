import { NextResponse } from "next/server";
import { runAgent, type AgentRunSummary } from "@/features/agent/run-agent";
import {
    expireStalePendingActions,
    getActiveGmailAccounts,
    getUserIdsWithSignalIntegration,
} from "@/db/queries";
import {
    getCronSecret,
    getIntakeServerUrl,
    getSyncSecret,
    isQueueEnabled,
} from "@/config/env";

export const preferredRegion = "sin1";
// The inline fallback can run several accounts; allow a long window.
export const maxDuration = 300;

const UNAUTHORIZED_ERROR = "Unauthorized.";
const SYNC_PATH = "/sync";
const SYNC_SECRET_HEADER = "x-secret";
// Enqueue is a quick fan-out call; the worker pool does the slow agent runs.
const ENQUEUE_TIMEOUT_MS = 15_000;

type SyncJob = {
    userId: string;
    integrationId: string;
};

type CronRun = AgentRunSummary & SyncJob;

export async function GET(request: Request) {
    return handleCronRequest(request);
}

export async function POST(request: Request) {
    return handleCronRequest(request);
}

async function handleCronRequest(request: Request) {
    try {
        if (!isAuthorized(request, getCronSecret())) {
            return NextResponse.json(
                { error: UNAUTHORIZED_ERROR },
                { status: 401 },
            );
        }

        await expireStalePendingActions();

        const jobs = await collectSyncJobs();

        if (isQueueEnabled()) {
            return await enqueueJobs(jobs);
        }

        return await runJobsInline(jobs);
    } catch (error) {
        console.error("[CRON] fetch-emails handler failed");
        console.error(error);

        return NextResponse.json(
            { error: "Cron execution failed." },
            { status: 500 },
        );
    }
}

// Scalable path: hand every account to the intake server's queue and return at
// once, so one cron tick fans out to the worker pool instead of blocking on it.
async function enqueueJobs(jobs: SyncJob[]) {
    if (jobs.length === 0) {
        return NextResponse.json({ mode: "queued", accountsQueued: 0 });
    }

    const endpoint = new URL(SYNC_PATH, getIntakeServerUrl()).toString();
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            [SYNC_SECRET_HEADER]: getSyncSecret(),
        },
        body: JSON.stringify({ jobs }),
        signal: AbortSignal.timeout(ENQUEUE_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(`Intake server returned status ${response.status}.`);
    }

    return NextResponse.json({ mode: "queued", accountsQueued: jobs.length });
}

// Fallback for local or single-account setups with no intake server configured.
async function runJobsInline(jobs: SyncJob[]) {
    const runs: CronRun[] = [];

    for (const job of jobs) {
        const summary = await runAgent(job.userId, job.integrationId);
        runs.push({ ...job, ...summary });
    }

    return NextResponse.json({
        mode: "inline",
        accountsProcessed: jobs.length,
        successfulRuns: runs.filter((run) => run.status === "success").length,
        failedRuns: runs.filter((run) => run.status === "error").length,
        runs,
    });
}

async function collectSyncJobs(): Promise<SyncJob[]> {
    const signalUserIds = await getUserIdsWithSignalIntegration();
    const jobs: SyncJob[] = [];

    for (const userId of signalUserIds) {
        const accounts = await getActiveGmailAccounts(userId);

        for (const account of accounts) {
            jobs.push({ userId, integrationId: account.id });
        }
    }

    return jobs;
}

function isAuthorized(request: Request, cronSecret: string) {
    const authorization = request.headers.get("authorization");

    return authorization === `Bearer ${cronSecret}`;
}
