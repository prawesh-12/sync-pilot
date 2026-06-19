import { NextResponse } from "next/server";
import {
    receiveSignalMessagesForSender,
    type InboundSignalMessage,
} from "@/features/signal/receive";
import { handleSignalReply } from "@/features/signal/handle-reply";
import { getSignalIntegrationsWithPendingActions } from "@/db/queries";
import { getCronSecret } from "@/config/env";

export const preferredRegion = "sin1";
// Receiving from signal-cli can be slow, so allow more than the default window.
export const maxDuration = 60;

const UNAUTHORIZED_ERROR = "Unauthorized.";

type PollResult = {
    usersPolled: number;
    repliesHandled: number;
};

type PendingSignalIntegration = Awaited<
    ReturnType<typeof getSignalIntegrationsWithPendingActions>
>[number];

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
    const integrations = await getSignalIntegrationsWithPendingActions();
    console.log(
        `[SIGNAL] Polling ${integrations.length} Signal integrations with pending actions.`,
    );
    // /v1/receive/{sender} drains signal-cli's queue. Poll each linked sender
    // once, then route replies to the user whose recipient number sent them.
    const handledCounts = await Promise.all(
        groupBySender(integrations).map(pollSenderGroup),
    );
    const repliesHandled = handledCounts.reduce((total, count) => total + count, 0);
    const usersPolled = new Set(integrations.map((integration) => integration.userId))
        .size;

    return { usersPolled, repliesHandled };
}

async function pollSenderGroup(
    integrations: PendingSignalIntegration[],
): Promise<number> {
    const [firstIntegration] = integrations;

    if (!firstIntegration) {
        return 0;
    }

    const messages = await receiveSignalMessagesForSender(
        firstIntegration.senderNumber,
    );
    console.log(
        `[SIGNAL] Received ${messages.length} Signal messages for sender ending ${lastFour(firstIntegration.senderNumber)}.`,
    );
    const integrationByRecipient = new Map(
        integrations.map((integration) => [
            normalizePhoneNumber(integration.recipientNumber),
            integration,
        ]),
    );
    let handled = 0;

    // Process in order so a "revise" reply lands before a later "send".
    for (const message of messages) {
        const integration = integrationByRecipient.get(normalizeMessageSender(message));

        if (!integration) {
            console.log(
                `[SIGNAL] Ignored message from unmatched sender ending ${lastFour(message.from)}.`,
            );
            continue;
        }

        await handleSignalReply(integration.userId, message.text);
        handled += 1;
    }

    return handled;
}

function groupBySender(
    integrations: PendingSignalIntegration[],
): PendingSignalIntegration[][] {
    const groups = new Map<string, PendingSignalIntegration[]>();

    for (const integration of integrations) {
        const sender = normalizePhoneNumber(integration.senderNumber);
        const group = groups.get(sender) ?? [];
        group.push(integration);
        groups.set(sender, group);
    }

    return [...groups.values()];
}

function normalizeMessageSender(message: InboundSignalMessage) {
    return normalizePhoneNumber(message.from);
}

function normalizePhoneNumber(value: string) {
    return value.trim();
}

function lastFour(value: string) {
    return value.trim().slice(-4).padStart(4, "*");
}

function isAuthorized(request: Request, cronSecret: string) {
    const authorization = request.headers.get("authorization");

    return authorization === `Bearer ${cronSecret}`;
}
