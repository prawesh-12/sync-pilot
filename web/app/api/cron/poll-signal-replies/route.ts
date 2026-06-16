import { NextResponse } from "next/server";
import { receiveSignalMessages } from "@/features/signal/receive";
import { handleSignalReply } from "@/features/signal/handle-reply";
import { getUserIdsWithSignalIntegration } from "@/db/queries";
import { getCronSecret } from "@/config/env";

export const preferredRegion = "sin1";

const UNAUTHORIZED_ERROR = "Unauthorized.";

type PollResult = {
    usersPolled: number;
    repliesHandled: number;
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

        const result = await pollAllUsers();

        return NextResponse.json(result);
    } catch (error) {
        console.error("[CRON] poll-signal-replies handler failed");
        console.error(error);

        return NextResponse.json(
            { error: "Cron execution failed." },
            { status: 500 },
        );
    }
}

async function pollAllUsers(): Promise<PollResult> {
    const userIds = await getUserIdsWithSignalIntegration();
    let repliesHandled = 0;

    for (const userId of userIds) {
        repliesHandled += await pollUser(userId);
    }

    return { usersPolled: userIds.length, repliesHandled };
}

async function pollUser(userId: string): Promise<number> {
    const messages = await receiveSignalMessages(userId);

    // Process in order so a "revise" reply lands before a later "send".
    for (const message of messages) {
        await handleSignalReply(userId, message.text);
    }

    return messages.length;
}

function isAuthorized(request: Request, cronSecret: string) {
    const authorization = request.headers.get("authorization");

    return authorization === `Bearer ${cronSecret}`;
}
