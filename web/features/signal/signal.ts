import { z } from "zod";
import { getSignalIntegration } from "@/db/queries";
import { getSignalConfig, isSignalConfigured } from "@/config/env";

const SIGNAL_MESSAGE_TITLE = "New Email Summary";
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

function buildSignalMessage(summary: string, subject: string) {
    const parsedMessage = signalMessageSchema.parse({
        summary,
        subject,
    });
    const messageSubject = parsedMessage.subject || "(No subject)";

    return [
        SIGNAL_MESSAGE_TITLE,
        `Subject: ${messageSubject}`,
        "",
        parsedMessage.summary,
    ].join("\n");
}

export async function sendSignalMessage(
    summary: string,
    subject: string,
    userId: string,
): Promise<SignalSendResult> {
    if (!isSignalConfigured()) {
        const error = "Signal is not configured.";
        console.error(`[SIGNAL] ${error}`);

        return {
            ok: false,
            error,
        };
    }

    try {
        const signalIntegration = await getSignalIntegration(userId);

        if (!signalIntegration) {
            const error = "Signal is not connected for this user.";
            console.error(`[SIGNAL] ${error}`);

            return {
                ok: false,
                error,
            };
        }

        const senderNumber = normalizePhoneNumber(
            signalIntegration.senderNumber,
        );
        const recipientNumber = normalizePhoneNumber(
            signalIntegration.recipientNumber,
        );

        if (!senderNumber || !recipientNumber) {
            const error = "Signal numbers are incomplete for this user.";
            console.error(`[SIGNAL] ${error}`);

            return {
                ok: false,
                error,
            };
        }

        const config = getSignalConfig();
        const endpoint = getSignalSendEndpoint(config.restUrl);
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                number: senderNumber,
                recipients: [recipientNumber],
                message: buildSignalMessage(summary, subject),
            }),
            cache: "no-store",
            signal: AbortSignal.timeout(SIGNAL_REQUEST_TIMEOUT_MS),
        });
        const data = await readSignalResponse(response);

        return buildSignalResult(response.status, response.ok, data);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Signal send failed.";
        console.error(`[SIGNAL] ${message}`);

        return {
            ok: false,
            error: message,
        };
    }
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
