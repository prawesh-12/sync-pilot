import { z } from "zod";
import { getSignalIntegration } from "@/db/queries";
import { getSignalConfig, isSignalConfigured } from "@/config/env";

const SIGNAL_RECEIVE_PATH = "v1/receive";
const SIGNAL_RECEIVE_TIMEOUT_MS = 10_000;

// signal-cli-rest-api (normal mode) drains the queue on read, so each inbound
// message is delivered exactly once — no need to de-duplicate downstream.
const envelopeSchema = z.object({
  envelope: z
    .object({
      source: z.string().trim().optional().default(""),
      sourceNumber: z.string().trim().optional().default(""),
      dataMessage: z
        .object({ message: z.string().optional() })
        .nullish(),
    })
    .optional(),
});

const receiveResponseSchema = z.array(envelopeSchema);

export type InboundSignalMessage = {
  from: string;
  text: string;
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
    console.error(`[SIGNAL] receive failed for userId: ${userId} - ${reason}`);

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
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(SIGNAL_RECEIVE_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Signal receive returned status ${response.status}.`);
  }

  const data = await response.json().catch(() => null);

  return extractMessagesFromRecipient(data, recipient);
}

function extractMessagesFromRecipient(
  data: unknown,
  recipient: string,
): InboundSignalMessage[] {
  const parsed = receiveResponseSchema.safeParse(data);

  if (!parsed.success) {
    return [];
  }

  const messages: InboundSignalMessage[] = [];

  for (const entry of parsed.data) {
    const message = toInboundMessage(entry, recipient);

    if (message) {
      messages.push(message);
    }
  }

  return messages;
}

function toInboundMessage(
  entry: z.infer<typeof envelopeSchema>,
  recipient: string,
): InboundSignalMessage | null {
  const envelope = entry.envelope;
  const text = envelope?.dataMessage?.message?.trim() ?? "";
  const from = (envelope?.source || envelope?.sourceNumber || "").trim();

  if (!text || from !== recipient) {
    return null;
  }

  return { from, text };
}

function getReceiveEndpoint(senderNumber: string): string {
  const config = getSignalConfig();
  const base = config.restUrl.endsWith("/")
    ? config.restUrl
    : `${config.restUrl}/`;
  const path = `${SIGNAL_RECEIVE_PATH}/${encodeURIComponent(senderNumber)}`;

  return new URL(path, base).toString();
}
