import type { DecisionName, TriageToolContext } from "./types";

type ActionSpec = {
  decision: DecisionName;
  toolName: string;
  reason: string;
  args: Record<string, unknown>;
  run: () => Promise<unknown>;
};

// Runs a Gmail-mutating action and records its decision, logging on failure so
// one bad email never aborts the run. Gmail actions never notify on Signal.
export async function recordAction(
  ctx: TriageToolContext,
  spec: ActionSpec,
): Promise<{ notified: boolean }> {
  try {
    await spec.run();
    ctx.record(buildDecision(spec, false));
  } catch (error) {
    console.error(
      `[AGENT] ${spec.toolName} failed for userId: ${ctx.userId}, message: ${ctx.email.messageId}`,
    );
    console.error(error);
    ctx.record(buildDecision(spec, true));
  }

  return { notified: false };
}

function buildDecision(spec: ActionSpec, failed: boolean) {
  return {
    decision: spec.decision,
    reasoning: spec.reason,
    notified: false,
    toolCall: {
      name: spec.toolName,
      args: failed ? { ...spec.args, failed: true } : spec.args,
    },
  };
}
