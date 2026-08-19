import { describe, expect, it, vi } from "vitest";

// feedback-digest pulls in the db barrel for buildFeedbackDigest; the helpers
// under test are pure, so stub the DB layer to avoid loading a real client.
vi.mock("@/db/queries", () => ({ getRecentFeedback: vi.fn() }));

const { groupFeedback, describeGroup } = await import(
  "@/features/agent/feedback-digest"
);

describe("groupFeedback", () => {
  it("counts repeated action+decision pairs", () => {
    const groups = groupFeedback([
      { action: "discarded", decision: "draft_reply" },
      { action: "discarded", decision: "draft_reply" },
      { action: "overridden", decision: "summarize_notify" },
    ]);

    expect(groups).toHaveLength(2);
    const draft = groups.find((g) => g.decision === "draft_reply");
    expect(draft?.count).toBe(2);
  });

  it("returns an empty array for no feedback", () => {
    expect(groupFeedback([])).toEqual([]);
  });
});

describe("describeGroup", () => {
  it("uses singular phrasing for a single occurrence", () => {
    const line = describeGroup({ action: "discarded", decision: "draft_reply", count: 1 });
    expect(line).toContain("1 time");
    expect(line).not.toContain("1 times");
  });

  it("uses plural phrasing for multiple occurrences", () => {
    const line = describeGroup({ action: "discarded", decision: "draft_reply", count: 3 });
    expect(line).toContain("3 times");
  });
});
