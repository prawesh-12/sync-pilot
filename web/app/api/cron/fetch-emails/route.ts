import { NextResponse } from "next/server";
import { runAgent, type AgentRunSummary } from "@/features/agent/run-agent";
import {
    getActiveGmailAccounts,
    getUserIdsWithSignalIntegration,
} from "@/db/queries";
import { getCronSecret } from "@/config/env";

export const preferredRegion = "sin1";

const UNAUTHORIZED_ERROR = "Unauthorized.";

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
        const cronSecret = getCronSecret();

        if (!isAuthorized(request, cronSecret)) {
            return NextResponse.json(
                { error: UNAUTHORIZED_ERROR },
                { status: 401 },
            );
        }

        const jobs = await collectSyncJobs();
        const runs: CronRun[] = [];

        // One job per active Gmail account, processed in sequence for now.
        for (const job of jobs) {
            const summary = await runAgent(job.userId, job.integrationId);
            runs.push({ ...job, ...summary });
        }

        return NextResponse.json({
            accountsProcessed: jobs.length,
            successfulRuns: runs.filter((run) => run.status === "success")
                .length,
            failedRuns: runs.filter((run) => run.status === "error").length,
            runs,
        });
    } catch (error) {
        console.error("[CRON] fetch-emails handler failed");
        console.error(error);

        return NextResponse.json(
            { error: "Cron execution failed." },
            { status: 500 },
        );
    }
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
