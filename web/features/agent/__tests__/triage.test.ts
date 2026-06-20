import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmailDecision } from "@/features/agent/types";

// vi.hoisted so the fns exist when the hoisted vi.mock factory runs.
const { markEmailHandledIfAbsent, markEmailNotified } = vi.hoisted(() => ({
  markEmailHandledIfAbsent: vi.fn(),
  markEmailNotified: vi.fn(),
}));

// Mock the whole db barrel; recordHandled only touches these two writers, the
// rest of the import graph just needs the names to resolve.
vi.mock("@/db/queries", () => ({
  markEmailHandledIfAbsent,
  markEmailNotified,
}));

const { recordHandled, toolDidFail } = await import("@/features/agent/triage");

function decision(overrides: Partial<EmailDecision>): EmailDecision {
  return {
    gmailMessageId: "m1",
    subject: "Subject",
    decision: "summarize_notify",
    reasoning: "because",
    toolCalls: { name: "summarizeAndNotify", args: {} },
    notified: true,
    ...overrides,
  };
}

describe("toolDidFail", () => {
  it("is true only when toolCalls.args.failed === true", () => {
    expect(toolDidFail(decision({ toolCalls: { name: "x", args: { failed: true } } }))).toBe(true);
  });

  it("is false for a successful tool call", () => {
    expect(toolDidFail(decision({ toolCalls: { name: "x", args: { reason: "ok" } } }))).toBe(false);
  });

  it("is false when toolCalls is null", () => {
    expect(toolDidFail(decision({ toolCalls: null }))).toBe(false);
  });
});

describe("recordHandled", () => {
  beforeEach(() => {
    markEmailHandledIfAbsent.mockReset();
    markEmailNotified.mockReset();
  });

  it("marks notified for a non-self-persisting decision", async () => {
    await recordHandled("u1", "m1", decision({ decision: "summarize_notify" }));

    expect(markEmailNotified).toHaveBeenCalledWith("u1", "m1");
    expect(markEmailHandledIfAbsent).not.toHaveBeenCalled();
  });

  it("skips writing when a self-persisting tool succeeded", async () => {
    await recordHandled(
      "u1",
      "m1",
      decision({ decision: "draft_reply", toolCalls: { name: "draftReply", args: { reason: "ok" } } }),
    );

    expect(markEmailNotified).not.toHaveBeenCalled();
    expect(markEmailHandledIfAbsent).not.toHaveBeenCalled();
  });

  it("uses the non-clobbering backstop when a self-persisting tool failed", async () => {
    await recordHandled(
      "u1",
      "m1",
      decision({
        decision: "draft_reply",
        toolCalls: { name: "draftReply", args: { reason: "x", failed: true } },
      }),
    );

    expect(markEmailHandledIfAbsent).toHaveBeenCalledWith("u1", "m1");
    expect(markEmailNotified).not.toHaveBeenCalled();
  });
});
