import { describe, expect, it } from "vitest";
import type { DecisionValue } from "@/db/schema";
import {
  DECISION_LABELS,
  getDecisionBadgeClass,
  getDecisionLabel,
} from "@/lib/decisions";

// Every tool the agent can pick. A new tool must land here and in both maps.
const DECISIONS: DecisionValue[] = [
  "ignore",
  "summarize_notify",
  "escalate",
  "archive",
  "apply_label",
  "snooze",
  "draft_reply",
];

describe("decision labels", () => {
  it("covers every decision value", () => {
    expect(Object.keys(DECISION_LABELS).sort()).toEqual([...DECISIONS].sort());
  });

  it("returns a human label for each decision", () => {
    for (const decision of DECISIONS) {
      expect(getDecisionLabel(decision)).toMatch(/^[A-Z]/);
    }
  });

  it("labels draft_reply as Drafted", () => {
    expect(getDecisionLabel("draft_reply")).toBe("Drafted");
  });
});

describe("decision badge classes", () => {
  it("returns a class string for each decision", () => {
    for (const decision of DECISIONS) {
      expect(getDecisionBadgeClass(decision)).toContain("border-");
    }
  });

  it("gives each decision its own colour", () => {
    const classes = DECISIONS.map(getDecisionBadgeClass);

    expect(new Set(classes).size).toBe(DECISIONS.length);
  });
});
