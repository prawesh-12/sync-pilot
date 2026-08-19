import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GmailEmail } from "@/features/gmail/gmail";
import {
  buildTriageTools,
  createDecisionRecorder,
  type RecordedDecision,
} from "@/features/agent/tools";
import { recordAction } from "@/features/agent/tools/record-action";
import type { TriageToolContext } from "@/features/agent/tools/types";

const EMAIL = {
  messageId: "msg-1",
  threadId: "thread-1",
  subject: "Q3 deck",
  from: "Dana <dana@acme.com>",
  body: "Can you send the deck before Friday?",
} as GmailEmail;

function makeContext() {
  const record = vi.fn<TriageToolContext["record"]>();
  const recordUsage = vi.fn<TriageToolContext["recordUsage"]>();
  const ctx: TriageToolContext = {
    email: EMAIL,
    userId: "user-1",
    connectedAccountId: "conn-1",
    record,
    recordUsage,
  };

  return Object.assign(ctx, { record, recordUsage });
}

const DECISION: RecordedDecision = {
  decision: "ignore",
  reasoning: "Newsletter.",
  notified: false,
  toolCall: { name: "ignore", args: {} },
};

describe("createDecisionRecorder", () => {
  it("starts with no decision", () => {
    expect(createDecisionRecorder().get()).toBeNull();
  });

  it("keeps the decision it is given", () => {
    const recorder = createDecisionRecorder();
    recorder.record(DECISION);

    expect(recorder.get()).toEqual(DECISION);
  });

  // One email gets one decision: a model that calls a second tool must not be
  // able to overwrite the first.
  it("ignores every decision after the first", () => {
    const recorder = createDecisionRecorder();
    recorder.record(DECISION);
    recorder.record({ ...DECISION, decision: "archive" });

    expect(recorder.get()?.decision).toBe("ignore");
  });
});

describe("buildTriageTools", () => {
  it("exposes one tool per action the agent can take", () => {
    expect(Object.keys(buildTriageTools(makeContext())).sort()).toEqual([
      "applyLabel",
      "archiveEmail",
      "draftReply",
      "escalateUrgent",
      "ignore",
      "snoozeEmail",
      "summarizeAndNotify",
    ]);
  });
});

describe("ignore tool", () => {
  it("records the decision and notifies nobody", async () => {
    const ctx = makeContext();
    const tools = buildTriageTools(ctx);

    const result = await tools.ignore.execute?.(
      { reason: "Automated newsletter." },
      { toolCallId: "call-1", messages: [] },
    );

    expect(result).toEqual({ notified: false });
    expect(ctx.record).toHaveBeenCalledWith({
      decision: "ignore",
      reasoning: "Automated newsletter.",
      notified: false,
      toolCall: { name: "ignore", args: { reason: "Automated newsletter." } },
    });
  });
});

describe("recordAction", () => {
  const spec = {
    decision: "archive" as const,
    toolName: "archiveEmail",
    reason: "Resolved thread.",
    args: { reason: "Resolved thread." },
  };

  it("records the decision after the Gmail call succeeds", async () => {
    const ctx = makeContext();
    const run = vi.fn(async () => undefined);

    const result = await recordAction(ctx, { ...spec, run });

    expect(run).toHaveBeenCalledOnce();
    expect(result).toEqual({ notified: false });
    expect(ctx.record).toHaveBeenCalledWith({
      decision: "archive",
      reasoning: "Resolved thread.",
      notified: false,
      toolCall: { name: "archiveEmail", args: { reason: "Resolved thread." } },
    });
  });

  // One failing email must not abort the whole run, so the error is swallowed
  // and the decision is marked failed instead.
  it("marks the decision failed rather than throwing when Gmail errors", async () => {
    const ctx = makeContext();
    const run = vi.fn(async () => {
      throw new Error("gmail 403");
    });

    const result = await recordAction(ctx, { ...spec, run });

    expect(result).toEqual({ notified: false });
    expect(ctx.record).toHaveBeenCalledWith(
      expect.objectContaining({
        toolCall: {
          name: "archiveEmail",
          args: { reason: "Resolved thread.", failed: true },
        },
      }),
    );
  });

  it("never reports a Gmail action as notified", async () => {
    const ctx = makeContext();

    await recordAction(ctx, { ...spec, run: async () => undefined });

    expect(ctx.record.mock.calls[0][0].notified).toBe(false);
  });
});

describe("snoozeEmail tool", () => {
  const NOW = new Date("2026-06-15T12:00:00.000Z");
  const markEmailSnoozed = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    markEmailSnoozed.mockReset();
    markEmailSnoozed.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function snooze(until: string) {
    vi.doMock("@/db/queries", () => ({ markEmailSnoozed }));
    vi.resetModules();
    const { createSnoozeEmailTool } = await import(
      "@/features/agent/tools/snooze-email"
    );
    const ctx = makeContext();
    const tool = createSnoozeEmailTool(ctx);

    await tool.execute?.(
      { until, reason: "Handle after the launch." },
      { toolCallId: "call-1", messages: [] },
    );

    return { ctx, snoozedUntil: markEmailSnoozed.mock.calls[0]?.[2] as Date };
  }

  it("snoozes until a future timestamp the model supplied", async () => {
    const { snoozedUntil } = await snooze("2026-06-16T09:00:00.000Z");

    expect(snoozedUntil.toISOString()).toBe("2026-06-16T09:00:00.000Z");
  });

  it("falls back to 24 hours when the timestamp is in the past", async () => {
    const { snoozedUntil } = await snooze("2026-06-14T09:00:00.000Z");

    expect(snoozedUntil.toISOString()).toBe("2026-06-16T12:00:00.000Z");
  });

  it("falls back to 24 hours when the timestamp is unparseable", async () => {
    const { snoozedUntil } = await snooze("next tuesday");

    expect(snoozedUntil.toISOString()).toBe("2026-06-16T12:00:00.000Z");
  });

  it("records the resolved timestamp, not the model's raw string", async () => {
    const { ctx } = await snooze("next tuesday");

    expect(ctx.record).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "snooze",
        toolCall: {
          name: "snoozeEmail",
          args: {
            until: "2026-06-16T12:00:00.000Z",
            reason: "Handle after the launch.",
          },
        },
      }),
    );
  });
});
