import {
  FREE_MONTHLY_TOKEN_LIMIT,
  PRO_MONTHLY_TOKEN_LIMIT,
  PRO_PLAN_PRICE_INR,
  PRO_USAGE_MULTIPLIER,
} from "@/config/plans";
import type { DecisionValue } from "@/db/schema";

export type Faq = { question: string; answer: string };

export const REF_CODE = "A3X9";

export const HERO_SUMMARY =
  "SyncPilot checks your Gmail every few minutes and picks one thing to do with each email. Anything worth answering shows up on Signal as a draft. It waits there until you reply.";

// Sample data only; never put real mail on this page.
export const HERO_EXAMPLE = {
  sender: "Sadie Sink",
  subject: "Q3 deck timeline",
  receivedAt: "09:14",
  repliedAt: "09:15",
  draft: "Hi Sadie, I'll have the updated deck to you by Friday afternoon.",
};

export const FLOW_STOPS = [
  { name: "Gmail", detail: "New mail arrives" },
  { name: "SyncPilot", detail: "Picks one of seven actions" },
  { name: "Signal", detail: "The draft lands with a code" },
];

export type OverheadPoint = {
  key: "triage" | "drafting" | "control";
  label: string;
  title: string;
  detail: string;
  image: string;
};

export const OVERHEAD_POINTS: OverheadPoint[] = [
  {
    key: "triage",
    label: "It reads",
    title: "You stop opening the inbox to find out what is in it",
    detail: "Every new thread is read and given one of seven actions.",
    image: "/landing/feature-reads.webp",
  },
  {
    key: "drafting",
    label: "It writes",
    title: "Anything worth answering comes back already written",
    detail: "The draft lands on Signal with a four-character code.",
    image: "/landing/feature-writes.webp",
  },
  {
    key: "control",
    label: "You decide",
    title: "One word from you sends it",
    detail: "Reply send, no, or the change you want. Nothing else is needed.",
    image: "/landing/feature-decide.webp",
  },
];

export type CommandTone = "sent" | "discarded" | "revised";

export type CommandRow = {
  command: string;
  result: string;
  outcome: string;
  tone: CommandTone;
};

export const REPLY_COMMANDS: CommandRow[] = [
  {
    command: `${REF_CODE} send`,
    result: "Sends the draft as it stands",
    outcome: "Sent",
    tone: "sent",
  },
  {
    command: `${REF_CODE} no`,
    result: "Throws the draft away",
    outcome: "Discarded",
    tone: "discarded",
  },
  {
    command: `${REF_CODE} make it shorter`,
    result: "Rewrites it and sends it back to you",
    outcome: "New draft",
    tone: "revised",
  },
];

export type SampleDecision = {
  subject: string;
  reasoning: string;
  decision: DecisionValue;
  when: string;
};

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

// Pricing reads the same constants checkout uses.

export type Plan = {
  name: string;
  price: string;
  cadence?: string;
  badge?: string;
  summary: string;
  features: string[];
  featured: boolean;
};

const FREE_TOKENS_LABEL = FREE_MONTHLY_TOKEN_LIMIT.toLocaleString("en-US");
const PRO_TOKENS_LABEL = PRO_MONTHLY_TOKEN_LIMIT.toLocaleString("en-US");

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    cadence: "/month",
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
    badge: `${PRO_USAGE_MULTIPLIER}x usage`,
    summary: "For an inbox busy enough to run past the free monthly limit.",
    features: [
      "Everything on the free plan",
      `${PRO_TOKENS_LABEL} AI tokens a month`,
      "Same checks, same actions, same replies",
    ],
    featured: true,
  },
];

export const PRIVACY_POINTS = [
  "Drafts wait for your reply and expire after 24 hours",
  "No email bodies are stored once the draft is written",
  "Replies travel over Signal, encrypted end to end",
];

export const PRICING_NOTE = "Cancel any time. No card needed to start.";

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

export const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Actions", href: "#actions" },
  { label: "Commands", href: "#commands" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const GITHUB_URL = "https://github.com/prawesh-12/sync-pilot";

export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Docs", href: "/how-to-use" },
];
