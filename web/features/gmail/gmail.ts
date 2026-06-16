import { executeGmailTool } from "@/lib/composio";

const GMAIL_FETCH_EMAILS_TOOL = "GMAIL_FETCH_EMAILS";
const GMAIL_GET_PROFILE_TOOL = "GMAIL_GET_PROFILE";
const GMAIL_MAX_RESULTS = 20;
const DEFAULT_WINDOW_SECONDS = 15 * 60;
const HTML_TAG_PATTERN = /<[a-z!/][\s\S]*>/i;

export type GmailEmail = {
    messageId: string;
    subject: string;
    from: string;
    body: string;
};

export type GmailAccountSource = {
    userId: string;
    connectedAccountId: string;
    lastRunTimestamp: Date | null;
};

const EMAIL_ADDRESS_KEYS = ["emailAddress", "email_address", "email"];

export async function getConnectedGmailAddress(
    userId: string,
    connectedAccountId: string,
) {
    const result = await executeGmailTool(
        userId,
        GMAIL_GET_PROFILE_TOOL,
        {},
        connectedAccountId,
    );
    const emailAddress = findString(result.data, EMAIL_ADDRESS_KEYS);

    return emailAddress || null;
}

export async function fetchEmailsInTimeWindow(
    account: GmailAccountSource,
    windowEnd: Date,
) {
    const windowStart = getWindowStart(account.lastRunTimestamp, windowEnd);
    const query = buildTimeWindowQuery(windowStart, windowEnd);

    const result = await executeGmailTool(
        account.userId,
        GMAIL_FETCH_EMAILS_TOOL,
        {
            query,
            max_results: GMAIL_MAX_RESULTS,
        },
        account.connectedAccountId,
    );

    return extractMessages(result.data).reduce<GmailEmail[]>(
        (emails, rawMessage) => {
            const email = mapMessage(rawMessage);

            if (email) {
                emails.push(email);
            }

            return emails;
        },
        [],
    );
}

function getWindowStart(
    lastRunTimestamp: Date | null | undefined,
    windowEnd: Date,
) {
    if (lastRunTimestamp) {
        return new Date(lastRunTimestamp);
    }

    return new Date(windowEnd.getTime() - DEFAULT_WINDOW_SECONDS * 1000);
}

function buildTimeWindowQuery(windowStart: Date, windowEnd: Date) {
    const afterUnix = toUnixSeconds(windowStart);
    const beforeUnix = Math.max(afterUnix + 1, toUnixSeconds(windowEnd));

    return `after:${afterUnix} before:${beforeUnix}`;
}

function toUnixSeconds(value: Date) {
    return Math.floor(value.getTime() / 1000);
}

function extractMessages(data: Record<string, unknown>): Record<string, unknown>[] {
    const candidate =
        firstArray(data, ["messages", "emails", "data", "items"]) ?? [];

    return candidate.filter(
        (entry): entry is Record<string, unknown> =>
            typeof entry === "object" && entry !== null,
    );
}

function mapMessage(message: Record<string, unknown>): GmailEmail | null {
    const messageId = readString(message, [
        "messageId",
        "message_id",
        "id",
    ]);

    if (!messageId) {
        return null;
    }

    return {
        messageId,
        subject: readString(message, ["subject"]) || "(No subject)",
        from: readString(message, ["sender", "from"]) || "Unknown sender",
        body: getMessageBody(message),
    };
}

function getMessageBody(message: Record<string, unknown>) {
    const preview = message.preview;
    const previewBody =
        typeof preview === "object" && preview !== null
            ? readString(preview as Record<string, unknown>, ["body"])
            : "";
    const rawBody =
        readString(message, [
            "messageText",
            "message_text",
            "body",
            "snippet",
        ]) || previewBody;

    if (!rawBody) {
        return "";
    }

    if (HTML_TAG_PATTERN.test(rawBody)) {
        return stripHtml(rawBody);
    }

    return normalizeWhitespace(rawBody);
}

function firstArray(
    record: Record<string, unknown>,
    keys: string[],
): unknown[] | null {
    for (const key of keys) {
        const value = record[key];

        if (Array.isArray(value)) {
            return value;
        }
    }

    return null;
}

function readString(record: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
        const value = record[key];

        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "";
}

// Composio wraps tool output in varying nesting (e.g. data.response_data.*),
// so search the whole response tree for the first matching string field.
function findString(value: unknown, keys: string[]): string {
    if (!value || typeof value !== "object") {
        return "";
    }

    if (Array.isArray(value)) {
        for (const entry of value) {
            const found = findString(entry, keys);

            if (found) {
                return found;
            }
        }

        return "";
    }

    const record = value as Record<string, unknown>;
    const direct = readString(record, keys);

    if (direct) {
        return direct;
    }

    for (const nested of Object.values(record)) {
        const found = findString(nested, keys);

        if (found) {
            return found;
        }
    }

    return "";
}

function stripHtml(html: string) {
    const text = html
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">");

    return normalizeWhitespace(text);
}

function normalizeWhitespace(value: string) {
    return value
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
