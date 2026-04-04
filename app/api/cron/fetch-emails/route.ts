import { NextResponse } from "next/server";
import { runAgent, type AgentRunSummary } from "@/lib/agent/run-agent";
import {
    getUserIdsWithGmailIntegration,
    getUserIdsWithSignalIntegration,
} from "@/lib/db/queries";
import { getCronSecret } from "@/lib/env";

export const preferredRegion = "sin1";

const UNAUTHORIZED_ERROR = "Unauthorized.";

type CronRun = AgentRunSummary & {
    userId: string;
};

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

        const [gmailUserIds, signalUserIds] = await Promise.all([
            getUserIdsWithGmailIntegration(),
            getUserIdsWithSignalIntegration(),
        ]);
        const signalUserIdSet = new Set(signalUserIds);
        const userIds = gmailUserIds.filter((userId) =>
            signalUserIdSet.has(userId),
        );
        const runs: CronRun[] = [];

        for (const userId of userIds) {
            const summary = await runAgent(userId);
            runs.push({ userId, ...summary });
        }

        return NextResponse.json({
            usersProcessed: userIds.length,
            usersSkippedMissingSignal: Math.max(
                gmailUserIds.length - userIds.length,
                0,
            ),
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

function isAuthorized(request: Request, cronSecret: string) {
    const authorization = request.headers.get("authorization");

    return authorization === `Bearer ${cronSecret}`;
}
