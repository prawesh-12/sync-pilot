import { getRecentFeedback } from "@/db/queries";
import { getDecisionLabel } from "@/lib/decisions";
import type { DecisionValue, FeedbackActionValue } from "@/db/schema";

const FEEDBACK_LOOKBACK = 20;

type FeedbackGroup = {
  action: FeedbackActionValue;
  decision: DecisionValue;
  count: number;
};

// Summarises recent user overrides into one prompt line so the model can adjust;
// returns an empty string when there is nothing to report.
export async function buildFeedbackDigest(userId: string): Promise<string> {
  const feedback = await getRecentFeedback(userId, FEEDBACK_LOOKBACK);

  if (feedback.length === 0) {
    return "";
  }

  const parts = groupFeedback(feedback).map(describeGroup);

  return `Recent user feedback: ${parts.join("; ")}. Weigh this when choosing a tool.`;
}

function groupFeedback(
  feedback: { action: FeedbackActionValue; decision: DecisionValue }[],
): FeedbackGroup[] {
  const groups = new Map<string, FeedbackGroup>();

  for (const entry of feedback) {
    const key = `${entry.action}:${entry.decision}`;
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      groups.set(key, { action: entry.action, decision: entry.decision, count: 1 });
    }
  }

  return [...groups.values()];
}

function describeGroup(group: FeedbackGroup): string {
  const times = group.count === 1 ? "time" : "times";

  return `the user ${group.action} your "${getDecisionLabel(group.decision)}" decision ${group.count} ${times}`;
}
