import { gmail_v1, google } from "googleapis";
import { decrypt } from "@/lib/encryption";
import { getIntegration } from "@/db/queries";
import { getGoogleOAuthConfig } from "@/config/env";

const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const GMAIL_USER_ID = "me";
const GMAIL_MAX_RESULTS = 20;
const DEFAULT_WINDOW_SECONDS = 15 * 60;
const BASE64URL_CHARACTERS = [
    { from: "-", to: "+" },
    { from: "_", to: "/" },
];

export type GmailEmail = {
    messageId: string;
    subject: string;
    from: string;
    body: string;
};

type GmailIntegrationTokens = {
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
};

export function createGoogleOAuthClient() {
    const config = getGoogleOAuthConfig();

    return new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        config.redirectUri,
    );
}

export function getGoogleAuthorizationUrl(userId: string) {
    const oauthClient = createGoogleOAuthClient();

    return oauthClient.generateAuthUrl({
        access_type: "offline",
        include_granted_scopes: true,
        prompt: "consent",
        scope: [GMAIL_READONLY_SCOPE],
        state: userId,
    });
}

export async function exchangeGoogleCode(code: string) {
    const oauthClient = createGoogleOAuthClient();
    const { tokens } = await oauthClient.getToken(code);

    return tokens;
}

export async function getConnectedGmailAddress(
    integrationTokens: GmailIntegrationTokens,
) {
    const oauthClient = createGoogleOAuthClient();
    oauthClient.setCredentials({
        access_token: decrypt(integrationTokens.accessTokenEncrypted),
        refresh_token: decrypt(integrationTokens.refreshTokenEncrypted),
    });

    const gmail = google.gmail({ version: "v1", auth: oauthClient });
    const profile = await gmail.users.getProfile({ userId: GMAIL_USER_ID });

    return profile.data.emailAddress?.trim() || null;
}

export async function fetchEmailsInTimeWindow(userId: string, windowEnd: Date) {
    const integration = await getIntegration(userId);

    if (!integration) {
        throw new Error("Gmail integration not found.");
    }

    const windowStart = getWindowStart(integration.lastRunTimestamp, windowEnd);
    const query = buildTimeWindowQuery(windowStart, windowEnd);

    const oauthClient = createGoogleOAuthClient();
    oauthClient.setCredentials({
        access_token: decrypt(integration.accessTokenEncrypted),
        refresh_token: decrypt(integration.refreshTokenEncrypted),
    });

    const gmail = google.gmail({ version: "v1", auth: oauthClient });
    const response = await gmail.users.messages.list({
        userId: GMAIL_USER_ID,
        q: query,
        maxResults: GMAIL_MAX_RESULTS,
    });
    const emails: GmailEmail[] = [];

    for (const message of response.data.messages ?? []) {
        const messageId = message.id?.trim();

        if (!messageId) {
            continue;
        }

        emails.push(await fetchEmail(gmail, messageId));
    }

    return emails;
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

async function fetchEmail(gmail: gmail_v1.Gmail, messageId: string) {
    const response = await gmail.users.messages.get({
        userId: GMAIL_USER_ID,
        id: messageId,
        format: "full",
    });
    const payload = response.data.payload;

    return {
        messageId,
        subject: getHeaderValue(payload?.headers, "Subject") || "(No subject)",
        from: getHeaderValue(payload?.headers, "From") || "Unknown sender",
        body: getMessageBody(payload, response.data.snippet),
    };
}

function getHeaderValue(
    headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
    name: string,
) {
    return headers
        ?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
        ?.value?.trim();
}

function getMessageBody(
    payload: gmail_v1.Schema$MessagePart | undefined,
    snippet: string | null | undefined,
) {
    const plainText = findBodyContent(payload, "text/plain");

    if (plainText) {
        return normalizeWhitespace(plainText);
    }

    const htmlText = findBodyContent(payload, "text/html");

    if (htmlText) {
        return stripHtml(htmlText);
    }

    return normalizeWhitespace(snippet ?? "");
}

function findBodyContent(
    part: gmail_v1.Schema$MessagePart | undefined,
    mimeType: string,
): string {
    if (!part) {
        return "";
    }

    if (part.mimeType === mimeType && part.body?.data) {
        return decodeBodyData(part.body.data);
    }

    for (const childPart of part.parts ?? []) {
        const content = findBodyContent(childPart, mimeType);

        if (content) {
            return content;
        }
    }

    return "";
}

function decodeBodyData(data: string) {
    let normalized = data;

    for (const entry of BASE64URL_CHARACTERS) {
        normalized = normalized.replaceAll(entry.from, entry.to);
    }

    return Buffer.from(normalized, "base64").toString("utf8");
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
