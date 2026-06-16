import type { DecisionValue } from "@/db/schema";

// Short, human labels for each agent decision shown in the dashboard and audit view.
export const DECISION_LABELS: Record<DecisionValue, string> = {
  ignore: "Ignored",
  summarize_notify: "Summarized",
  escalate: "Escalated",
  archive: "Archived",
  apply_label: "Labeled",
  snooze: "Snoozed",
  draft_reply: "Drafted",
};

// Badge styling per decision, matching the dashboard's translucent palette.
const DECISION_BADGE_CLASSES: Record<DecisionValue, string> = {
  ignore: "border-gray-500/20 bg-gray-500/15 text-gray-300",
  summarize_notify: "border-emerald-500/20 bg-emerald-500/15 text-emerald-300",
  escalate: "border-red-500/20 bg-red-500/15 text-red-300",
  archive: "border-sky-500/20 bg-sky-500/15 text-sky-300",
  apply_label: "border-amber-500/20 bg-amber-500/15 text-amber-300",
  snooze: "border-indigo-500/20 bg-indigo-500/15 text-indigo-300",
  draft_reply: "border-[#A089E6]/30 bg-[#A089E6]/15 text-[#C4B5F5]",
};

export function getDecisionLabel(decision: DecisionValue): string {
  return DECISION_LABELS[decision];
}

export function getDecisionBadgeClass(decision: DecisionValue): string {
  return DECISION_BADGE_CLASSES[decision];
}
