import { describe, expect, it } from "vitest";
import {
  classifyCommand,
  extractRefCode,
  stripRefCode,
  type PendingAction,
} from "@/features/signal/parse-reply";

// classifyCommand only reads pending.refCode for the ref_usage case; a minimal
// stub stands in for the full DB row.
const pending = { refCode: "S48P" } as PendingAction;

describe("extractRefCode", () => {
  it("extracts and upper-cases a valid 4-char ref code", () => {
    expect(extractRefCode("s48p send")).toBe("S48P");
  });

  it("returns null when the first token is the wrong length", () => {
    expect(extractRefCode("S48 send")).toBeNull();
    expect(extractRefCode("S48PX send")).toBeNull();
  });

  it("returns null for characters outside the ref-code alphabet", () => {
    // 'I', 'O', '0', '1' are excluded from the alphabet.
    expect(extractRefCode("S4O1")).toBeNull();
  });

  it("rejects a code wrapped in punctuation (the literal-bracket trap)", () => {
    expect(extractRefCode('"S48P send"')).toBeNull();
    expect(extractRefCode("[S48P]")).toBeNull();
  });
});

describe("stripRefCode", () => {
  it("removes the leading token and one separating space", () => {
    expect(stripRefCode("S48P make it shorter")).toBe("make it shorter");
  });

  it("returns empty string when there is only a ref code", () => {
    expect(stripRefCode("S48P")).toBe("");
  });
});

describe("classifyCommand", () => {
  it("maps send/yes keywords to draft_send", () => {
    expect(classifyCommand(pending, "send").kind).toBe("draft_send");
    expect(classifyCommand(pending, "yes").kind).toBe("draft_send");
  });

  it("maps no/discard keywords to draft_discard", () => {
    expect(classifyCommand(pending, "no").kind).toBe("draft_discard");
    expect(classifyCommand(pending, "discard").kind).toBe("draft_discard");
  });

  it("treats an empty command as a usage hint", () => {
    expect(classifyCommand(pending, "  ").kind).toBe("ref_usage");
  });

  it("treats free text as revise instructions", () => {
    const result = classifyCommand(pending, "make it shorter");
    expect(result.kind).toBe("draft_revise");
    if (result.kind === "draft_revise") {
      expect(result.instructions).toBe("make it shorter");
    }
  });
});
