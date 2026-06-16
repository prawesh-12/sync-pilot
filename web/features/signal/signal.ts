import { z } from "zod";
import { getSignalIntegration } from "@/db/queries";
import { getSignalConfig, isSignalConfigured } from "@/config/env";

const SIGNAL_MESSAGE_TITLE = "New Email Summary";
const SIGNAL_URGENT_MESSAGE_TITLE = "URGENT";
const SIGNAL_DRAFT_MESSAGE_TITLE = "Draft ready";
const SIGNAL_SEND_PATH = "v2/send";
const SIGNAL_QR_CODE_LINK_PATH = "v1/qrcodelink";
const SIGNAL_REQUEST_TIMEOUT_MS = 10_000;

const signalMessageSchema = z.object({
    summary: z.string().trim().min(1),
    subject: z.string().trim().default("(No subject)"),
});

const signalSuccessSchema = z.union([
    z.object({
        timestamp: z.string().optional(),
    }),
    z.object({
        message: z.string().optional(),
    }),
    z.array(z.unknown()),
]);

const signalErrorSchema = z.object({
    error: z.string().trim().optional(),
    message: z.string().trim().optional(),
});

type SignalSendResult = {
    ok: boolean;
    error?: string;
    statusCode?: number;
};

type SignalMessageOptions = {
    urgent?: boolean;
};

type SignalNumbers = {
    sender: string;
    recipient: string;
};

type DraftReadyInput = {
    subject: string;
    preview: string;
    refCode: string;
};

function buildSignalMessage(
    summary: string,
    subject: string,
    options?: SignalMessageOptions,
) {
    const parsedMessage = signalMessageSchema.parse({
        summary,
        subject,
    });
    const messageSubject = parsedMessage.subject || "(No subject)";
    const title = options?.urgent
        ? SIGNAL_URGENT_MESSAGE_TITLE
        : SIGNAL_MESSAGE_TITLE;

    return [
        title,
        `Subject: ${messageSubject}`,
        "",
        parsedMessage.summary,
    ].join("\n");
}

function buildDraftReadyMessage(input: DraftReadyInput) {
    return [
        `${SIGNAL_DRAFT_MESSAGE_TITLE} for: ${input.subject || "(No subject)"}`,
        `Preview: ${input.preview}`,
        "",
        `Reply "${input.refCode} send" to send`,
        `Reply "${input.refCode} no" to discard`,
        `Reply "${input.refCode} [edit instructions]" to revise`,
    ].join("\n");
}

export async function sendSignalMessage(
    summary: string,
    subject: string,
    userId: string,
    options?: SignalMessageOptions,
): Promise<SignalSendResult> {
    return dispatchSignalMessage(
        buildSignalMessage(summary, subject, options),
        userId,
    );
}

export async function sendDraftReadyMessage(
    input: DraftReadyInput,
    userId: string,
): Promise<SignalSendResult> {
    return dispatchSignalMessage(buildDraftReadyMessage(input), userId);
}

// Sends a plain confirmation/error line back to the user (e.g. after a Signal reply).
export async function sendSignalNotice(
    userId: string,
    message: string,
): Promise<SignalSendResult> {
    return dispatchSignalMessage(message, userId);
}

async function dispatchSignalMessage(
    message: string,
    userId: string,
): Promise<SignalSendResult> {
    if (!isSignalConfigured()) {
        return failResult("Signal is not configured.");
    }

    try {
        const numbers = await resolveSignalNumbers(userId);

        if (!numbers) {
            return failResult("Signal is not connected for this user.");
        }

        return await postSignalMessage(numbers, message);
    } catch (error) {
        const reason =
            error instanceof Error ? error.message : "Signal send failed.";

        return failResult(reason);
    }
}

async function resolveSignalNumbers(
    userId: string,
): Promise<SignalNumbers | null> {
    const integration = await getSignalIntegration(userId);

    if (!integration) {
        return null;
    }

    const sender = normalizePhoneNumber(integration.senderNumber);
    const recipient = normalizePhoneNumber(integration.recipientNumber);

    if (!sender || !recipient) {
        return null;
    }

    return { sender, recipient };
}

async function postSignalMessage(
    numbers: SignalNumbers,
    message: string,
): Promise<SignalSendResult> {
    const config = getSignalConfig();
    const endpoint = getSignalSendEndpoint(config.restUrl);
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            number: numbers.sender,
            recipients: [numbers.recipient],
            message,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(SIGNAL_REQUEST_TIMEOUT_MS),
    });
    const data = await readSignalResponse(response);

    return buildSignalResult(response.status, response.ok, data);
}

function failResult(error: string): SignalSendResult {
    console.error(`[SIGNAL] ${error}`);

    return {
        ok: false,
        error,
    };
}

export function buildSignalDeviceName(userId: string) {
    const normalizedUserId = userId
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);

    if (!normalizedUserId) {
        return "syncpilot";
    }

    return `syncpilot-${normalizedUserId}`;
}

export function getSignalQrCodeLink(deviceName: string) {
    const config = getSignalConfig();
    const url = new URL(
        SIGNAL_QR_CODE_LINK_PATH,
        addTrailingSlash(config.restUrl),
    );

    url.searchParams.set("device_name", deviceName);

    return url.toString();
}

function getSignalSendEndpoint(restUrl: string) {
    return new URL(SIGNAL_SEND_PATH, addTrailingSlash(restUrl)).toString();
}

function normalizePhoneNumber(value: string) {
    return value.trim();
}

function addTrailingSlash(value: string) {
    return value.endsWith("/") ? value : `${value}/`;
}

async function readSignalResponse(response: Response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return (await response.json().catch(() => null)) as unknown;
    }

    const text = await response.text().catch(() => "");

    return text.trim() ? { message: text.trim() } : null;
}

function buildSignalResult(statusCode: number, ok: boolean, data: unknown) {
    if (!ok) {
        const error = getSignalErrorMessage(data, statusCode);
        console.error(`[SIGNAL] ${error}`);

        return {
            ok: false,
            error,
            statusCode,
        };
    }

    signalSuccessSchema.safeParse(data);

    return {
        ok: true,
        statusCode,
    };
}

function getSignalErrorMessage(data: unknown, status: number) {
    const parsedError = signalErrorSchema.safeParse(data);

    if (parsedError.success) {
        return (
            parsedError.data.error ||
            parsedError.data.message ||
            defaultSignalError(status)
        );
    }

    return defaultSignalError(status);
}

function defaultSignalError(status: number) {
    return `Signal request failed with status ${status}.`;
}
