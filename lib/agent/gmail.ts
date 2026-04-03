import { gmail_v1, google } from "googleapis";
import { decrypt } from "@/lib/encryption";
import { getIntegration, isEmailProcessed } from "@/lib/db/queries";
import { getGoogleOAuthConfig } from "@/lib/env";

const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const GMAIL_USER_ID = "me";
const GMAIL_SEARCH_QUERY = "is:unread";
const GMAIL_MAX_RESULTS = 20;
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

export async function fetchUnreadEmails(userId: string) {
  const integration = await getIntegration(userId);

  if (!integration) {
    throw new Error("Gmail integration not found.");
  }

  const oauthClient = createGoogleOAuthClient();
  oauthClient.setCredentials({
    access_token: decrypt(integration.accessTokenEncrypted),
    refresh_token: decrypt(integration.refreshTokenEncrypted),
  });

  const gmail = google.gmail({ version: "v1", auth: oauthClient });
  const response = await gmail.users.messages.list({
    userId: GMAIL_USER_ID,
    q: GMAIL_SEARCH_QUERY,
    maxResults: GMAIL_MAX_RESULTS,
  });
  const emails: GmailEmail[] = [];

  for (const message of response.data.messages ?? []) {
    const messageId = message.id?.trim();

    if (!messageId || (await isEmailProcessed(messageId))) {
      continue;
    }

    emails.push(await fetchUnreadEmail(gmail, messageId));
  }

  return emails;
}

async function fetchUnreadEmail(gmail: gmail_v1.Gmail, messageId: string) {
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
  return headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
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
