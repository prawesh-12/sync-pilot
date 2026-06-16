import { summariseEmail } from "@/features/ai/summarise";
import { sendSignalMessage } from "@/features/signal/signal";
import type { GmailEmail } from "@/features/gmail/gmail";

type NotifyOptions = {
  urgent?: boolean;
};

// Shared by summarizeAndNotify and escalateUrgent; returns whether Signal sent.
export async function summariseAndNotify(
  email: GmailEmail,
  userId: string,
  options?: NotifyOptions,
): Promise<boolean> {
  try {
    const summary = await summariseEmail({
      subject: email.subject,
      from: email.from,
      // Fall back to the subject so an empty body still has content to summarise.
      body: email.body || email.subject,
    });

    if (!summary.trim()) {
      return false;
    }

    const result = await sendSignalMessage(
      summary,
      email.subject,
      userId,
      options,
    );

    if (!result.ok) {
      console.error(
        `[SIGNAL] Failed to send for: ${email.subject} (${result.error || "Unknown error"})`,
      );

      return false;
    }

    console.log(
      `[SIGNAL] Sent ${options?.urgent ? "urgent " : ""}summary for: ${email.subject}`,
    );

    return true;
  } catch (error) {
    console.error(`[AI] Failed to summarise email: ${email.subject}`);
    console.error(error);

    return false;
  }
}
