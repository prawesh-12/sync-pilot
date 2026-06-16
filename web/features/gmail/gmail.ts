import { executeGmailTool } from "@/lib/composio";
import { findString, firstArray, readString } from "@/features/gmail/parse";

const GMAIL_FETCH_EMAILS_TOOL = "GMAIL_FETCH_EMAILS";
const GMAIL_GET_PROFILE_TOOL = "GMAIL_GET_PROFILE";
const GMAIL_FETCH_MESSAGE_TOOL = "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID";
const GMAIL_MESSAGE_FORMAT = "full";
const GMAIL_MAX_RESULTS = 20;
const DEFAULT_WINDOW_SECONDS = 15 * 60;
const HTML_TAG_PATTERN = /<[a-z!/][\s\S]*>/i;

export type GmailEmail = {
    messageId: string;
    threadId: string;
    subject: string;
    from: string;
    body: string;
};

export type GmailAccountSource = {
    userId: string;
    connectedAccountId: string;
    lastRunTimestamp: Date | null;
};

// Minimal account shape for tools that act on a single message.
export type GmailActionAccount = {
    userId: string;
    connectedAccountId: string;
};

const EMAIL_ADDRESS_KEYS = ["emailAddress", "email_address", "email"];
const BODY_KEYS = ["messageText", "message_text", "body", "snippet"];

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

// Re-fetches one message by id so a snoozed email can return to triage.
export async function fetchEmailById(
    account: GmailActionAccount,
    messageId: string,
): Promise<GmailEmail | null> {
    const result = await executeGmailTool(
        account.userId,
        GMAIL_FETCH_MESSAGE_TOOL,
        {
            message_id: messageId,
            format: GMAIL_MESSAGE_FORMAT,
        },
        account.connectedAccountId,
    );

    return mapFetchedMessage(result.data, messageId);
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
    const messageId = readString(message, ["messageId", "message_id", "id"]);

    if (!messageId) {
        return null;
    }

    return {
        messageId,
        threadId: readString(message, ["threadId", "thread_id"]),
        subject: readString(message, ["subject"]) || "(No subject)",
        from: readString(message, ["sender", "from"]) || "Unknown sender",
        body: getMessageBody(message),
    };
}

// Single-message fetches nest fields unpredictably, so search the whole tree.
function mapFetchedMessage(
    data: Record<string, unknown>,
    messageId: string,
): GmailEmail {
    return {
        messageId,
        threadId: findString(data, ["threadId", "thread_id"]),
        subject: findString(data, ["subject"]) || "(No subject)",
        from: findString(data, ["sender", "from"]) || "Unknown sender",
        body: cleanBody(findString(data, BODY_KEYS)),
    };
}

function getMessageBody(message: Record<string, unknown>) {
    const preview = message.preview;
    const previewBody =
        typeof preview === "object" && preview !== null
            ? readString(preview as Record<string, unknown>, ["body"])
            : "";
    const rawBody = readString(message, BODY_KEYS) || previewBody;

    return cleanBody(rawBody);
}

function cleanBody(rawBody: string) {
    if (!rawBody) {
        return "";
    }

    if (HTML_TAG_PATTERN.test(rawBody)) {
        return stripHtml(rawBody);
    }

    return normalizeWhitespace(rawBody);
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
