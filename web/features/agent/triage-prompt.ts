import type { GmailEmail } from "@/features/gmail/gmail";

const TRIAGE_BODY_MAX_CHARACTERS = 4000;

// System prompt for the inbox triage agent; extended with new tools over time.
// feedbackDigest is an optional one-line summary of the user's recent overrides.
export function buildTriagePrompt(
  userName: string,
  nowIso: string,
  feedbackDigest = "",
) {
  const lines = [
    `You are SyncPilot's inbox triage agent for ${userName}.`,
    `Current time (ISO 8601): ${nowIso}.`,
    "For the email below, call exactly one tool:",
    "",
    "- ignore: newsletters, automated no-reply senders, already-resolved threads",
    "- summarizeAndNotify: anything informational (default when unsure)",
    "- escalateUrgent: deadline language, VIP senders, anything time-sensitive",
    "- archiveEmail: low-priority mail you have read the gist of and needs no reply",
    "- applyLabel: categorize the email under a short label name",
    "- snoozeEmail: defer the email to a future ISO 8601 timestamp computed from the current time",
    "- draftReply: write a reply and save it to Gmail Drafts for the user to confirm; it is never sent automatically",
    "",
    "For draftReply, write the full reply text yourself in the body argument.",
    'End every drafted reply with "Best regards," on its own line, then the' +
      " user's own name. Infer that name from the user's email address above" +
      " (the part before the @, formatted as a proper name); never use a" +
      " placeholder or the name of whoever sent the incoming email.",
    "Always include a one-sentence reason.",
    "When unsure between ignore and summarizeAndNotify — pick summarizeAndNotify.",
  ];

  if (feedbackDigest) {
    lines.push("", feedbackDigest);
  }

  return lines.join("\n");
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
