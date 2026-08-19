import {
  AlarmClock,
  AlignLeft,
  Archive,
  CircleSlash,
  Tag,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

export type Decision = { name: string; detail: string; icon: LucideIcon };
export type Faq = { question: string; answer: string };
export type ActivityEvent = { time: string; text: string };
export type JourneyStation = { system: string; title: string; meta: string };
export type SignalMessage = {
  id: string;
  author: "syncpilot" | "user";
  text: string;
  code?: string;
  time: string;
  confirmed?: boolean;
};

export const HERO_SUMMARY =
  "SyncPilot reads your Gmail on a schedule, commits to one action per email, and sends the result to Signal. Drafted replies wait there until you answer.";

// One worked example runs through every panel so the page reads as a single case.
export const SAMPLE_EMAIL = {
  sender: "Priya Shah",
  address: "priya@northwind.co",
  subject: "Q3 deck timeline",
  preview: "Can you get me the updated deck by Friday?",
  receivedAt: "09:14",
};

export const SAMPLE_DRAFT = {
  refCode: "A3X9",
  lines: [
    "Hi Priya,",
    "I'll have the updated deck ready by Friday afternoon.",
    "Best regards,",
    "Prawesh",
  ],
};

export const SELECTED_DECISION: Decision = {
  name: "Draft reply",
  detail: "Written and saved to Gmail drafts. Nothing sends without confirmation.",
  icon: AlignLeft,
};

export const DECISION_REASON =
  "Names a deadline and asks a direct question, so it needs a response before Friday.";

export const ALTERNATE_DECISIONS: Decision[] = [
  { name: "Summarize", detail: "Send the gist, no reply needed", icon: AlignLeft },
  { name: "Escalate", detail: "Flag as urgent", icon: TriangleAlert },
  { name: "Label", detail: "File under a Gmail label", icon: Tag },
  { name: "Archive", detail: "Clear it from the inbox", icon: Archive },
  { name: "Snooze", detail: "Resurface it later", icon: AlarmClock },
  { name: "Leave it alone", detail: "Not worth an interruption", icon: CircleSlash },
];

export const SIGNAL_MESSAGES: SignalMessage[] = [
  {
    id: "draft-ready",
    author: "syncpilot",
    text: "Draft ready for: Q3 deck timeline",
    code: "A3X9",
    time: "09:14",
  },
  { id: "approval", author: "user", text: "A3X9 send", time: "09:15" },
  {
    id: "confirmation",
    author: "syncpilot",
    text: "Sent your reply for: Q3 deck timeline",
    time: "09:15",
    confirmed: true,
  },
];

export const REPLY_COMMANDS = [
  { command: "A3X9 send", result: "Sends the draft" },
  { command: "A3X9 no", result: "Discards it" },
  { command: "A3X9 make it shorter", result: "Rewrites and re-sends the draft" },
];

// The same message in each state it passes through, not five separate examples.
export const JOURNEY: JourneyStation[] = [
  { system: "Gmail", title: "Q3 deck timeline", meta: "Priya Shah · 09:14" },
  { system: "SyncPilot", title: "Draft reply", meta: "1 of 7 actions" },
  { system: "Signal", title: "Draft ready", meta: "A3X9" },
  { system: "You", title: "A3X9 send", meta: "09:15" },
  { system: "Gmail", title: "Reply added to thread", meta: "09:15" },
];

export const ACTIVITY_STREAM: ActivityEvent[] = [
  { time: "09:15", text: "24 emails checked" },
  { time: "09:16", text: "2 drafts waiting" },
  { time: "09:17", text: "1 reply confirmed" },
];

export const ONBOARDING_STEPS = [
  { name: "Connect Gmail", detail: "Read-only access through Google OAuth" },
  { name: "Link Signal", detail: "Scan one QR code from the dashboard" },
];

export const FAQS: Faq[] = [
  {
    question: "Does it ever send email without me?",
    answer:
      "No. Every draft waits for a reply from you on Signal before it goes anywhere. If you never reply, the draft expires after 24 hours and nothing is sent.",
  },
  {
    question: "Why Signal and not WhatsApp or Slack?",
    answer:
      "Because it's the app you already have open, and it's encrypted end to end. SyncPilot connects through Signal's own client protocol using a self-hosted signal-cli bridge. It is not affiliated with or endorsed by Signal.",
  },
  {
    question: "How often does it check my inbox?",
    answer:
      "Every 5 to 15 minutes. Your Signal replies are picked up separately, about once a minute, so sending or discarding a draft feels close to instant.",
  },
  {
    question: "Can I change what it wrote before sending?",
    answer:
      "Yes. Instead of replying “send”, reply with what you want changed — “make it shorter”, “push the date to Monday” — and it rewrites the draft and sends it back under the same code.",
  },
  {
    question: "Is my email data stored?",
    answer:
      "Placeholder — this answer needs exact wording confirmed before launch. Do not ship the page with this text.",
  },
  {
    question: "What does it cost?",
    answer:
      "Free to use today. A paid Pro plan is coming, but nothing is gated behind it right now.",
  },
  {
    question: "Do I need to keep anything open?",
    answer:
      "No. SyncPilot runs as a scheduled background job. Your laptop can be shut and your browser closed.",
  },
];
