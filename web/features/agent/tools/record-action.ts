import { scopedLogger } from "@/lib/logger";
import type { DecisionName, TriageToolContext } from "./types";

const log = scopedLogger("AGENT");

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
    log.error(
      {
        tool: spec.toolName,
        userId: ctx.userId,
        messageId: ctx.email.messageId,
        err: error,
      },
      "Gmail action failed",
    );
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
