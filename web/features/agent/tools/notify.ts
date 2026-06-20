import { summariseEmail } from "@/features/ai/summarise";
import { sendSignalMessage } from "@/features/signal/signal";
import { scopedLogger } from "@/lib/logger";
import type { GmailEmail } from "@/features/gmail/gmail";
import type { LanguageModelUsage } from "ai";

const log = scopedLogger("AGENT");

type NotifyOptions = {
  urgent?: boolean;
};

// Whether Signal sent, plus the token usage of the summary call for accounting.
type NotifyResult = {
  notified: boolean;
  usage: LanguageModelUsage | undefined;
};

// Shared by summarizeAndNotify and escalateUrgent.
export async function summariseAndNotify(
  email: GmailEmail,
  userId: string,
  options?: NotifyOptions,
): Promise<NotifyResult> {
  const { text, usage } = await summariseSafely(email);

  if (!text) {
    return { notified: false, usage };
  }

  const notified = await sendSummaryToSignal(text, email, userId, options);

  return { notified, usage };
}

async function summariseSafely(
  email: GmailEmail,
): Promise<{ text: string; usage: LanguageModelUsage | undefined }> {
  try {
    const summary = await summariseEmail({
      subject: email.subject,
      from: email.from,
      // Fall back to the subject so an empty body still has content to summarise.
      body: email.body || email.subject,
    });

    return { text: summary.text.trim(), usage: summary.usage };
  } catch (error) {
    log.error({ subject: email.subject, err: error }, "failed to summarise email");

    return { text: "", usage: undefined };
  }
}

async function sendSummaryToSignal(
  summary: string,
  email: GmailEmail,
  userId: string,
  options?: NotifyOptions,
): Promise<boolean> {
  const result = await sendSignalMessage(summary, email.subject, userId, options);

  if (!result.ok) {
    log.error(
      { subject: email.subject, error: result.error || "Unknown error" },
      "Signal summary send failed",
    );

    return false;
  }

  log.info(
    { subject: email.subject, urgent: Boolean(options?.urgent) },
    "summary sent",
  );

  return true;
}
