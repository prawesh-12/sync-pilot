import { NextResponse } from "next/server";
import {
    receiveSignalMessagesForSender,
    type InboundSignalMessage,
} from "@/features/signal/receive";
import {
    FAILURE_NOTICE,
    handleSignalReply,
} from "@/features/signal/handle-reply";
import { sendSignalNotice } from "@/features/signal/signal";
import {
    getProcessableInboundMessages,
    getSignalIntegrationsWithPendingActions,
    markInboundFailed,
    markInboundProcessed,
    saveInboundMessages,
    type NewInboundMessage,
    type ProcessableInboundMessage,
} from "@/db/queries";
import { getCronSecret } from "@/config/env";
import { secureEquals } from "@/lib/secure-compare";
import { scopedLogger } from "@/lib/logger";
import {
    groupBySender,
    indexByRecipient,
    lastFour,
    normalizePhoneNumber,
} from "@/features/signal/routing";

const log = scopedLogger("SIGNAL");

export const preferredRegion = "sin1";
// Receiving from signal-cli can be slow, so allow more than the default window.
export const maxDuration = 60;

const UNAUTHORIZED_ERROR = "Unauthorized.";
// Retry a failed inbound message this many times before giving up ("dead").
const MAX_PROCESS_ATTEMPTS = 5;

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
        log.error({ err: error }, "poll-signal-replies handler failed");

        return NextResponse.json(
            { error: "Cron execution failed." },
            { status: 500 },
        );
    }
}

async function pollAllUsers(): Promise<PollResult> {
    const integrations = await getSignalIntegrationsWithPendingActions();
    log.info(
        { integrations: integrations.length },
        "polling Signal integrations with pending actions",
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
    log.info(
        {
            count: messages.length,
            sender: lastFour(firstIntegration.senderNumber),
        },
        "received Signal messages for sender",
    );

    // Durability boundary: persist drained messages BEFORE processing, so a
    // crash/redeploy mid-loop can't lose an already-consumed reply.
    await persistDrainedMessages(integrations, messages);

    const userIds = [...new Set(integrations.map((i) => i.userId))];
    return processPendingMessages(userIds);
}

// Matches each drained message to its owning integration (by recipient number)
// and stores it; messages from unmatched senders are logged and dropped.
async function persistDrainedMessages(
    integrations: PendingSignalIntegration[],
    messages: InboundSignalMessage[],
): Promise<void> {
    const integrationByRecipient = indexByRecipient(integrations);
    const rows: NewInboundMessage[] = [];

    messages.forEach((message, index) => {
        const integration = integrationByRecipient.get(
            normalizeMessageSender(message),
        );

        if (!integration) {
            log.info(
                { sender: lastFour(message.from) },
                "ignored message from unmatched sender",
            );
            return;
        }

        rows.push({
            userId: integration.userId,
            sourceNumber: message.from,
            text: message.text,
            // Fall back to a unique-ish value if signal-cli omits the timestamp,
            // so distinct messages can't collide on the dedup key.
            signalTimestamp: message.timestamp || Date.now() + index,
        });
    });

    await saveInboundMessages(rows);
}

// Processes received + retryable-failed messages for these users, each isolated
// so one bad reply can't abort the batch. Success/failure is recorded; the user
// is notified only once, when retries are finally exhausted.
async function processPendingMessages(userIds: string[]): Promise<number> {
    const pending = await getProcessableInboundMessages(
        userIds,
        MAX_PROCESS_ATTEMPTS,
    );
    let handled = 0;

    // Oldest-first (query order) so a "revise" reply lands before a later "send".
    for (const row of pending) {
        const ok = await processOne(row);

        if (ok) {
            handled += 1;
        }
    }

    return handled;
}

async function processOne(row: ProcessableInboundMessage): Promise<boolean> {
    try {
        await handleSignalReply(row.userId, row.text);
        await markInboundProcessed(row.id);
        return true;
    } catch (error) {
        const reason =
            error instanceof Error ? error.message : "Unknown processing error.";
        const status = await markInboundFailed(
            row.id,
            row.attempts,
            MAX_PROCESS_ATTEMPTS,
            reason,
        );
        log.error(
            { messageRowId: row.id, status, reason },
            "failed to process inbound message",
        );

        if (status === "dead") {
            await notifyGaveUp(row.userId);
        }

        return false;
    }
}

// Best-effort final notice; never let a failed notice mask the original error.
async function notifyGaveUp(userId: string): Promise<void> {
    try {
        await sendSignalNotice(userId, FAILURE_NOTICE);
    } catch (error) {
        log.error({ userId, err: error }, "failed to send give-up notice");
    }
}

function normalizeMessageSender(message: InboundSignalMessage) {
    return normalizePhoneNumber(message.from);
}

function isAuthorized(request: Request, cronSecret: string) {
    const authorization = request.headers.get("authorization");

    if (!authorization || !cronSecret) {
        return false;
    }

    return secureEquals(authorization, `Bearer ${cronSecret}`);
}
