import type { GmailEmail } from "@/features/gmail/gmail";

const TRIAGE_BODY_MAX_CHARACTERS = 4000;

// System prompt for the inbox triage agent; extended with new tools each phase.
export function buildTriagePrompt(userName: string) {
  return [
    `You are SyncPilot's inbox triage agent for ${userName}.`,
    "For the email below, call exactly one tool:",
    "",
    "- ignore: newsletters, automated no-reply senders, already-resolved threads",
    "- summarizeAndNotify: anything informational (default when unsure)",
    "- escalateUrgent: deadline language, VIP senders, anything time-sensitive",
    "",
    "Always include a one-sentence reason.",
    "When unsure between ignore and summarizeAndNotify — pick summarizeAndNotify.",
  ].join("\n");
}

// The single email handed to the model for a triage decision.
export function buildTriageUserMessage(email: GmailEmail) {
  const body = truncateBody(email.body);

  return [
    `From: ${email.from}`,
    `Subject: ${email.subject}`,
    "",
    body || "(No body content)",
  ].join("\n");
}

function truncateBody(body: string) {
  const trimmed = body.trim();

  if (trimmed.length <= TRIAGE_BODY_MAX_CHARACTERS) {
    return trimmed;
  }

  return `${trimmed.slice(0, TRIAGE_BODY_MAX_CHARACTERS).trimEnd()}\n\n[... truncated ...]`;
}
