import { FREE_MONTHLY_TOKEN_LIMIT, PRO_PLAN_PRICE_INR } from "@/config/plans";
import type { DecisionValue } from "@/db/schema";

export type Faq = { question: string; answer: string };
export type JourneyStation = {
  system: "gmail" | "syncpilot" | "signal" | "you";
  label: string;
  title: string;
  meta: string;
};

export const REF_CODE = "A3X9";

export const HERO_SUMMARY =
  "SyncPilot checks your Gmail every few minutes and picks one thing to do with each email. Anything worth answering shows up on Signal as a draft. It waits there until you reply.";

// One worked example runs through every panel so the page reads as a single case.
export const SAMPLE_EMAIL = {
  sender: "Sadie Sink",
  subject: "Q3 deck timeline",
  preview: "Can you get me the updated deck by Friday?",
  receivedAt: "09:14",
};

export const SAMPLE_DRAFT = {
  refCode: REF_CODE,
  // One line each: the hero panel never scrolls, so the draft has to fit.
  body: "Hi Sadie, I'll have the updated deck to you by Friday afternoon.",
  shortBody: "Hi Sadie, the deck lands Friday afternoon.",
};

/* -- The seven actions ----------------------------------------------------- */

export type ActionKey =
  | "draft_reply"
  | "summarize_notify"
  | "escalate"
  | "apply_label"
  | "archive"
  | "snooze"
  | "ignore";

export type Action = { key: ActionKey; name: string; detail: string };

export const CHOSEN_ACTION: Action = {
  key: "draft_reply",
  name: "Draft reply",
  detail: "Written and saved to your Gmail drafts. It sends only after you say so.",
};

export const REJECTED_ACTIONS: Action[] = [
  { key: "summarize_notify", name: "Summarize", detail: "Send the gist, no reply needed" },
  { key: "escalate", name: "Escalate", detail: "Flag it as urgent" },
  { key: "apply_label", name: "Label", detail: "File it under a Gmail label" },
  { key: "archive", name: "Archive", detail: "Clear it from the inbox" },
  { key: "snooze", name: "Snooze", detail: "Bring it back later" },
  { key: "ignore", name: "Ignore", detail: "Not worth an interruption" },
];

export const TOTAL_ACTIONS = REJECTED_ACTIONS.length + 1;

export const DECISION_REASON =
  "It names a deadline and asks a direct question, so it needs an answer before Friday.";

/* -- Why it exists ---------------------------------------------------------
   The overhead the product removes, stated as work rather than as adjectives.
   Every number here is one the product actually enforces; nothing is invented
   to sound impressive.
   ------------------------------------------------------------------------- */

export const WHY_HEADING =
  "An inbox is not a list of messages. It is a list of decisions.";

export const WHY_SUMMARY =
  "Every unread thread asks the same three questions: does this matter, what does it need, and what do I say back? Answering them is the work. The typing is the easy part.";

export type OverheadPoint = {
  key: "triage" | "drafting" | "control";
  label: string;
  title: string;
  detail: string;
};

export const OVERHEAD_POINTS: OverheadPoint[] = [
  {
    key: "triage",
    label: "It reads",
    title: "You stop opening the inbox to find out what is in it",
    detail: "Every new thread is read and given one of seven actions.",
  },
  {
    key: "drafting",
    label: "It writes",
    title: "Anything worth answering comes back already written",
    detail: "The draft lands on Signal with a four-character code.",
  },
  {
    key: "control",
    label: "You decide",
    title: "Nothing leaves your account without your word",
    detail: "A draft waits 24 hours for your reply, then expires.",
  },
];

/* The before / after at the heart of the section: the same email, counted as
   decisions. Five of them collapse into one. */

/* Two to four words each: the icon beside a step carries the rest. */
export const MANUAL_STEPS = [
  "Open inbox",
  "Read thread",
  "Weigh the options",
  "Write reply",
  "Remember to send",
];

export const SYNCPILOT_STEP = {
  title: "Reply “send”",
  detail: "One message on Signal, one word back.",
};

/* -- The journey ----------------------------------------------------------- */

export const JOURNEY_SUMMARY =
  "One email crosses five systems and waits for a single word from you. Follow it the whole way.";

export const JOURNEY: JourneyStation[] = [
  { system: "gmail", label: "Gmail", title: "Q3 deck timeline", meta: "Sadie Sink · 09:14" },
  { system: "syncpilot", label: "SyncPilot", title: "Draft reply", meta: "1 of 7 actions" },
  { system: "signal", label: "Signal", title: "Draft ready", meta: REF_CODE },
  { system: "you", label: "You", title: "A3X9 send", meta: "09:15" },
  { system: "gmail", label: "Gmail", title: "Reply added to thread", meta: "09:15" },
];

/* -- Commands -------------------------------------------------------------- */

export type CommandRow = {
  command: string;
  result: string;
  outcome: string;
  tone: "sent" | "discarded" | "revised";
};

export const REPLY_COMMANDS: CommandRow[] = [
  {
    command: "A3X9 send",
    result: "Sends the draft as it stands",
    outcome: "Sent",
    tone: "sent",
  },
  {
    command: "A3X9 no",
    result: "Throws the draft away",
    outcome: "Discarded",
    tone: "discarded",
  },
  {
    command: "A3X9 make it shorter",
    result: "Rewrites it and sends it back to you",
    outcome: "New draft",
    tone: "revised",
  },
];

/* -- Activity log ---------------------------------------------------------- */

export type ActivityKind = "check" | "draft" | "sent" | "archive" | "summarize" | "snooze";
export type ActivityEvent = { gapMinutes: number; text: string; kind: ActivityKind };

// Minutes past midnight for the first row. Every later row is this plus the
// running total of the gaps, so the clock only ever moves forward.
export const ACTIVITY_START_MINUTES = 9 * 60 + 14;

export const ACTIVITY_STREAM: ActivityEvent[] = [
  { gapMinutes: 0, text: "Checked your inbox, 6 new", kind: "check" },
  { gapMinutes: 1, text: "Draft ready for: Q3 deck timeline", kind: "draft" },
  { gapMinutes: 1, text: "Reply added to the thread", kind: "sent" },
  { gapMinutes: 7, text: "Checked your inbox, nothing new", kind: "check" },
  { gapMinutes: 9, text: "Archived 3 newsletters", kind: "archive" },
  { gapMinutes: 2, text: "Summary sent for: invoice 4021", kind: "summarize" },
  { gapMinutes: 6, text: "Snoozed 1 email until tomorrow", kind: "snooze" },
  { gapMinutes: 5, text: "Checked your inbox, 2 new", kind: "check" },
];

export const ACTIVITY_FACTS = [
  { value: "5 to 15 min", label: "Between inbox checks" },
  { value: "7", label: "Actions it can pick from" },
  { value: "24 hours", label: "A draft waits, then expires" },
];

/* -- Agent decisions ------------------------------------------------------- */

export type SampleDecision = {
  subject: string;
  reasoning: string;
  decision: DecisionValue;
  when: string;
};

// Sample data, not a capture of anyone's inbox. Never put real mail on this page.
export const SAMPLE_DECISIONS: SampleDecision[] = [
  {
    subject: "Q3 deck timeline",
    reasoning: "Names a deadline and asks a direct question, so it needs an answer.",
    decision: "draft_reply",
    when: "2 minutes ago",
  },
  {
    subject: "Card payment failed for invoice 4021",
    reasoning: "Billing is at risk and the sender is your payment provider.",
    decision: "escalate",
    when: "18 minutes ago",
  },
  {
    subject: "Your weekly design digest",
    reasoning: "A newsletter you read in batches, so it does not need an alert.",
    decision: "archive",
    when: "34 minutes ago",
  },
  {
    subject: "Notes from Tuesday's planning call",
    reasoning: "Useful detail but no question in it, so the gist is enough.",
    decision: "summarize_notify",
    when: "1 hour ago",
  },
  {
    subject: "Contract review for Northwind",
    reasoning: "Legal thread you track separately, filed under Contracts.",
    decision: "apply_label",
    when: "2 hours ago",
  },
  {
    subject: "Standup moved to 10:30 tomorrow",
    reasoning: "Only matters in the morning, so it comes back then.",
    decision: "snooze",
    when: "3 hours ago",
  },
  {
    subject: "Re: Re: Fwd: lunch?",
    reasoning: "A social thread with nothing to action.",
    decision: "ignore",
    when: "4 hours ago",
  },
];

export const DECISION_LEGEND: DecisionValue[] = [
  "escalate",
  "summarize_notify",
  "draft_reply",
  "apply_label",
  "archive",
  "snooze",
  "ignore",
];

/* -- Pricing ---------------------------------------------------------------
   Only what the code actually enforces goes on these cards. Today that is the
   monthly AI usage limit in config/plans.ts. The price is read from the same
   constant that drives checkout, so the page cannot quote a different number
   from the one a customer is charged.
   ------------------------------------------------------------------------- */

export type Plan = {
  name: string;
  price: string;
  cadence?: string;
  badge?: string;
  summary: string;
  features: string[];
  featured: boolean;
};

const FREE_TOKENS_LABEL = `${(FREE_MONTHLY_TOKEN_LIMIT / 1000).toLocaleString("en-IN")},000`;

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: "Free",
    summary: "The whole product, with a monthly limit on how much AI it can use.",
    features: [
      "Inbox checked every 5 to 15 minutes",
      "All seven actions, including drafted replies",
      "Approve or reject every draft from Signal",
      "Full decision history in the dashboard",
      `${FREE_TOKENS_LABEL} AI tokens a month`,
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: `₹${PRO_PLAN_PRICE_INR}`,
    cadence: "/month",
    badge: "No usage cap",
    summary: "For an inbox busy enough to run past the free monthly limit.",
    features: [
      "Everything on the free plan",
      "No monthly cap on AI usage",
      "Same checks, same actions, same replies",
    ],
    featured: true,
  },
];

export const PRICING_NOTE = "Cancel any time. No card needed to start.";

/* -- Setup and FAQ --------------------------------------------------------- */

export const ONBOARDING_STEPS = [
  {
    number: "01",
    system: "gmail" as const,
    name: "Connect Gmail",
    detail: "One sign in with Google",
    time: "about 30 seconds",
  },
  {
    number: "02",
    system: "signal" as const,
    name: "Link Signal",
    detail: "Scan one QR code from the dashboard",
    time: "about 30 seconds",
  },
];

export const FAQS: Faq[] = [
  {
    question: "Does it ever send email without me?",
    answer:
      "No. Every draft waits for your reply on Signal. If you never answer, the draft expires after 24 hours and nothing is sent.",
  },
  {
    question: "What do I get on the free plan?",
    answer: `All seven actions and the full product. The only limit is ${FREE_TOKENS_LABEL} AI tokens a month, which covers a normal inbox.`,
  },
  {
    question: "What happens if I stop paying?",
    answer:
      "You drop back to the free plan at the end of the month you paid for. Nothing is deleted and your connections stay linked.",
  },
  {
    question: "Why Signal and not WhatsApp or Slack?",
    answer:
      "It is the app you already have open, and it is encrypted end to end. Nothing new to install.",
  },
  {
    question: "How often does it check my inbox?",
    answer:
      "Every 5 to 15 minutes. Your replies are picked up separately, about once a minute, so sending a draft feels close to instant.",
  },
  {
    question: "Can I change what it wrote before sending?",
    answer:
      "Yes. Reply with the change you want instead of the word send. Try “make it shorter” or “push the date to Monday”. It rewrites the draft and sends it back under the same code.",
  },
  {
    question: "Is my email data stored?",
    answer:
      "No email bodies are kept. We store your connection details and a count of what each check found. Message text goes to the AI model to write the draft, then it is gone.",
  },
  {
    question: "What access does it need to Gmail?",
    answer:
      "It reads new mail, saves drafts, and applies labels or archives when that is the action it picked. It never sends a reply on its own.",
  },
  {
    question: "Do I need to keep anything open?",
    answer:
      "No. SyncPilot runs on its own schedule. Your laptop can be shut and your browser closed.",
  },
];

export const SIGNAL_DISCLAIMER =
  "SyncPilot connects through Signal's own client protocol using a self-hosted bridge. It is not affiliated with or endorsed by Signal.";

export const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Commands", href: "#commands" },
  { label: "Decisions", href: "#decisions" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const HERO_PROOF = ["Nothing sends without your reply", "Free while in beta"];

export const FOOTER_PRODUCT_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Commands", href: "#commands" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Docs", href: "/how-to-use" },
];
