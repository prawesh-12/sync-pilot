import {
  AlarmClock,
  AlignLeft,
  Archive,
  CircleSlash,
  Reply,
  Tag,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

export type Fact = { stat: string; detail: string };
export type Step = { title: string; detail: string };
export type Decision = { icon: LucideIcon; name: string; detail: string };
export type Faq = { question: string; answer: string };

export const HERO_SUBHEAD =
  "SyncPilot reads every new email, decides what matters, and sends you a message on Signal — a summary, or a draft ready to go. Reply to send it, kill it, or tell it what to change. Nothing leaves your outbox until you say so.";

export const FACTS: Fact[] = [
  {
    stat: "Every 5–15 min",
    detail:
      "It checks Gmail on its own schedule. Nothing to open, nothing to refresh.",
  },
  {
    stat: "Under a minute",
    detail:
      "Signal replies are polled about once a minute, so confirmations land fast.",
  },
  {
    stat: "Exactly one action",
    detail: "One decision per email. Never a maybe, never left half-triaged.",
  },
];

export const STEPS: Step[] = [
  {
    title: "A new email lands in Gmail.",
    detail:
      "SyncPilot picks it up on the next sweep — no forwarding rules, no plugin.",
  },
  {
    title: "It reads the email and picks one action.",
    detail:
      "Reply, summarize, escalate, label, archive, snooze, or leave it alone. Exactly one, every time.",
  },
  {
    title: "You get a message on Signal.",
    detail:
      "Not a push notification. Not a new app. A message in a thread you already read.",
  },
  {
    title: "A drafted reply comes with a short code.",
    detail: "Text back “send”, “no”, or exactly what you want changed.",
  },
  {
    title: "It sends, discards, or rewrites — and confirms.",
    detail:
      "The confirmation arrives in the same thread. Nothing is ever sent without your reply.",
  },
];

export const DECISIONS: Decision[] = [
  {
    icon: Reply,
    name: "Draft a reply",
    detail: "Writes the response and holds it until you confirm on Signal.",
  },
  {
    icon: AlignLeft,
    name: "Summarize",
    detail: "Sends you the gist. Nothing to answer, nothing to open.",
  },
  {
    icon: TriangleAlert,
    name: "Escalate",
    detail: "Flags it as urgent so it reaches you ahead of everything else.",
  },
  {
    icon: Tag,
    name: "Label",
    detail: "Files it in Gmail under the label it belongs in.",
  },
  {
    icon: Archive,
    name: "Archive",
    detail: "Clears it out of the inbox without a word from you.",
  },
  {
    icon: AlarmClock,
    name: "Snooze",
    detail: "Puts it away and brings it back when it's actually relevant.",
  },
  {
    icon: CircleSlash,
    name: "Leave it alone",
    detail: "Decides it isn't worth interrupting anyone over.",
  },
];

export const FAQS: Faq[] = [
  {
    question: "Why Signal and not WhatsApp or Slack?",
    answer:
      "Because it's the app you already have open, and it's encrypted end to end. SyncPilot is meant to disappear into a conversation you're already having, not become another tab you have to remember to check.",
  },
  {
    question: "Does it ever send email without me?",
    answer:
      "No. Every draft waits for a reply from you on Signal before it goes anywhere. If you never reply, the draft expires after 24 hours and nothing is sent.",
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
      "Free to use today. A paid Pro plan is coming, but nothing is gated behind it right now — every feature described on this page is available on the free plan.",
  },
  {
    question: "Do I need to keep anything open?",
    answer:
      "No. SyncPilot runs as a scheduled background job. Your laptop can be shut, your browser closed — the only thing you need is Signal on your phone.",
  },
];
