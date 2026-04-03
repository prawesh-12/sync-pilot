import { z } from "zod";
import { getSignalConfig, isSignalConfigured } from "@/lib/env";

const SIGNAL_MESSAGE_TITLE = "New Email Summary";

const signalSuccessSchema = z.object({
  timestamp: z.string().optional(),
});

type SignalSendResult = {
  ok: boolean;
  error?: string;
};

function buildSignalMessage(summary: string, subject: string) {
  return [SIGNAL_MESSAGE_TITLE, `Subject: ${subject}`, "", summary].join("\n");
}

export async function sendSignalMessage(
  summary: string,
  subject: string,
): Promise<SignalSendResult> {
  if (!isSignalConfigured()) {
    const error = "Signal is not configured.";
    console.error(error);

    return {
      ok: false,
      error,
    };
  }

  try {
    const config = getSignalConfig();
    const endpoint = new URL("/v1/send", config.restUrl).toString();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: config.senderNumber,
        recipients: [config.recipientNumber],
        message: buildSignalMessage(summary, subject),
      }),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      const error = getSignalErrorMessage(data, response.status);
      console.error(error);

      return {
        ok: false,
        error,
      };
    }

    signalSuccessSchema.safeParse(data);

    return {
      ok: true,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Signal send failed.";
    console.error(message);

    return {
      ok: false,
      error: message,
    };
  }
}

function getSignalErrorMessage(data: unknown, status: number) {
  if (data && typeof data === "object") {
    const error = readStringField(data, "error");

    if (error) {
      return error;
    }

    const message = readStringField(data, "message");

    if (message) {
      return message;
    }
  }

  return `Signal request failed with status ${status}.`;
}

function readStringField(value: object, key: string) {
  const candidate = value as Record<string, unknown>;

  return typeof candidate[key] === "string" ? candidate[key] : "";
}
