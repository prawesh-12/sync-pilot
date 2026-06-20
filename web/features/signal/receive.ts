import { z } from "zod";
import { getSignalIntegration } from "@/db/queries";
import {
  getSignalAuthHeaders,
  getSignalConfig,
  isSignalConfigured,
} from "@/config/env";
import { scopedLogger } from "@/lib/logger";

const log = scopedLogger("SIGNAL");

const SIGNAL_RECEIVE_PATH = "v1/receive";
// Generous: a slow signal-cli read drains the queue server-side, so aborting
// early would silently lose the message. Better to wait than to drop a reply.
const SIGNAL_RECEIVE_TIMEOUT_MS = 25_000;
const EMPTY_TEXT = "";

const optionalString = z
  .string()
  .trim()
  .nullish()
  .transform((value) => value ?? EMPTY_TEXT);

// signal-cli-rest-api (normal mode) drains the queue on read, so each inbound
// message is delivered exactly once — no need to de-duplicate downstream.
// Note-to-self replies arrive from the user's own phone as a syncMessage, not a
// dataMessage, so both shapes must be read to catch every reply.
const envelopeSchema = z.object({
  envelope: z
    .object({
      source: optionalString,
      sourceNumber: optionalString,
      timestamp: z.number().nullish(),
      dataMessage: z
        .object({ message: optionalString })
        .nullish(),
      syncMessage: z
        .object({
          sentMessage: z
            .object({
              destination: optionalString,
              destinationNumber: optionalString,
              message: optionalString,
              timestamp: z.number().nullish(),
            })
            .nullish(),
        })
        .nullish(),
    })
    .optional(),
});

const receiveResponseSchema = z.array(envelopeSchema);

export type InboundSignalMessage = {
  from: string;
  text: string;
  // signal-cli envelope timestamp (epoch ms); 0 when absent.
  timestamp: number;
};

// Reads new Signal messages addressed to the user's linked number, keeping only
// real text from the registered recipient phone.
export async function receiveSignalMessages(
  userId: string,
): Promise<InboundSignalMessage[]> {
  if (!isSignalConfigured()) {
    return [];
  }

  const integration = await getSignalIntegration(userId);

  if (!integration) {
    return [];
  }

  try {
    return await fetchInboundMessages(integration);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Signal receive failed.";
    log.error({ userId, reason }, "Signal receive failed");

    return [];
  }
}

// Reads once for a linked Signal sender number. The receive endpoint drains
// signal-cli's queue, so callers that handle multiple users on one sender
// should call this once and route by message.from.
export async function receiveSignalMessagesForSender(
  senderNumber: string,
): Promise<InboundSignalMessage[]> {
  if (!isSignalConfigured()) {
    return [];
  }

  try {
    return await fetchInboundMessagesForSender(senderNumber);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Signal receive failed.";
    log.error({ senderNumber, reason }, "Signal receive failed");

    return [];
  }
}

async function fetchInboundMessages(integration: {
  senderNumber: string;
  recipientNumber: string;
}): Promise<InboundSignalMessage[]> {
  const sender = integration.senderNumber.trim();
  const recipient = integration.recipientNumber.trim();
  const endpoint = getReceiveEndpoint(sender);
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json", ...getSignalAuthHeaders() },
    cache: "no-store",
    signal: AbortSignal.timeout(SIGNAL_RECEIVE_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await readSignalError(response);

    throw new Error(
      `Signal receive returned status ${response.status}${detail ? `: ${detail}` : ""}.`,
    );
  }

  const data = await response.json().catch(() => null);

  return extractMessagesFromRecipient(data, recipient);
}

async function fetchInboundMessagesForSender(
  senderNumber: string,
): Promise<InboundSignalMessage[]> {
  const endpoint = getReceiveEndpoint(senderNumber.trim());
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json", ...getSignalAuthHeaders() },
    cache: "no-store",
    signal: AbortSignal.timeout(SIGNAL_RECEIVE_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await readSignalError(response);

    throw new Error(
      `Signal receive returned status ${response.status}${detail ? `: ${detail}` : ""}.`,
    );
  }

  const data = await response.json().catch(() => null);

  return extractMessages(data);
}

async function readSignalError(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = (await response.json().catch(() => null)) as unknown;

    if (data && typeof data === "object") {
      if ("error" in data) {
        return String(data.error);
      }

      if ("message" in data) {
        return String(data.message);
      }
    }
  }

  return response.text().then((text) => text.trim()).catch(() => "");
}

function extractMessagesFromRecipient(
  data: unknown,
  recipient: string,
): InboundSignalMessage[] {
  return extractMessages(data).filter((message) => message.from === recipient);
}

function extractMessages(data: unknown): InboundSignalMessage[] {
  const parsed = receiveResponseSchema.safeParse(data);

  if (!parsed.success) {
    log.info(
      { shape: describeReceiveShape(data) },
      "receive response shape not recognized",
    );
    return [];
  }

  const messages: InboundSignalMessage[] = [];

  for (const entry of parsed.data) {
    const message = toInboundMessage(entry);

    if (message) {
      messages.push(message);
    }
  }

  if (parsed.data.length > 0 && messages.length === 0) {
    log.info(
      { envelopes: parsed.data.length, shape: describeReceiveShape(data) },
      "receive response had envelopes but no text messages",
    );
  }

  return messages;
}

function toInboundMessage(
  entry: z.infer<typeof envelopeSchema>,
): InboundSignalMessage | null {
  const envelope = entry.envelope;
  const rawText =
    envelope?.dataMessage?.message ??
    envelope?.syncMessage?.sentMessage?.message ??
    "";
  const text = rawText.trim();
  const from = (
    envelope?.sourceNumber ||
    envelope?.syncMessage?.sentMessage?.destinationNumber ||
    envelope?.syncMessage?.sentMessage?.destination ||
    envelope?.source ||
    ""
  ).trim();
  const timestamp =
    envelope?.timestamp ?? envelope?.syncMessage?.sentMessage?.timestamp ?? 0;

  if (!text || !from) {
    return null;
  }

  return { from, text, timestamp };
}

function describeReceiveShape(data: unknown) {
  if (!Array.isArray(data)) {
    return `type=${typeof data}`;
  }

  return data
    .slice(0, 3)
    .map((entry, index) => describeEntry(entry, index))
    .join("; ");
}

function describeEntry(entry: unknown, index: number) {
  if (!entry || typeof entry !== "object") {
    return `entry${index}=type:${typeof entry}`;
  }

  const envelope = "envelope" in entry ? entry.envelope : null;

  if (!envelope || typeof envelope !== "object") {
    return `entry${index}=keys:${Object.keys(entry).join(",")}`;
  }

  const source = getStringField(envelope, "source");
  const sourceNumber = getStringField(envelope, "sourceNumber");
  const dataMessage = getObjectField(envelope, "dataMessage");
  const syncMessage = getObjectField(envelope, "syncMessage");
  const sentMessage = syncMessage
    ? getObjectField(syncMessage, "sentMessage")
    : null;

  return [
    `entry${index}`,
    `source:${lastFour(source)}`,
    `sourceNumber:${lastFour(sourceNumber)}`,
    `dataMessage:${dataMessage ? "yes" : "no"}`,
    `syncMessage:${syncMessage ? "yes" : "no"}`,
    `sentMessage:${sentMessage ? "yes" : "no"}`,
  ].join(" ");
}

function getObjectField(source: object, key: string) {
  const value = (source as Record<string, unknown>)[key];

  return value && typeof value === "object" ? value : null;
}

function getStringField(source: object, key: string) {
  const value = (source as Record<string, unknown>)[key];

  return typeof value === "string" ? value : "";
}

function lastFour(value: string) {
  return value ? value.slice(-4).padStart(4, "*") : "none";
}

function getReceiveEndpoint(senderNumber: string): string {
  const config = getSignalConfig();
  const base = config.restUrl.endsWith("/")
    ? config.restUrl
    : `${config.restUrl}/`;
  const path = `${SIGNAL_RECEIVE_PATH}/${encodeURIComponent(senderNumber)}`;

  return new URL(path, base).toString();
}
