import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createTextCompletion = vi.fn();

vi.mock("@/features/ai/groq", () => ({ createTextCompletion }));

const { parseAgentResult } = await import("@/features/agent/result-parser");

const FALLBACK_INPUT = {
  task: "Triage the inbox",
  context: "Sender: dana@acme.com Thread summary: needs the Q3 deck by Friday.",
};

// The minimum the schema accepts; individual tests override single fields.
function validResult(overrides: Record<string, unknown> = {}) {
  return {
    headline: "Send the deck",
    summary: "Dana needs the Q3 deck before Friday.",
    riskLevel: "low",
    automationReadiness: "ready",
    confidence: 88,
    suggestedTags: ["deck"],
    recommendedActions: [
      { action: "Send the deck", owner: "operator", detail: "Attach the Q3 deck." },
    ],
    missingInformation: [],
    draftReply: "Sending it over today.",
    ...overrides,
  };
}

beforeEach(() => {
  createTextCompletion.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("parseAgentResult on well-formed output", () => {
  it("parses a bare JSON object", async () => {
    const result = await parseAgentResult(
      JSON.stringify(validResult()),
      FALLBACK_INPUT,
    );

    expect(result.headline).toBe("Send the deck");
    expect(result.confidence).toBe(88);
    expect(createTextCompletion).not.toHaveBeenCalled();
  });

  it("parses JSON inside a fenced code block", async () => {
    const text = "Here you go:\n```json\n" + JSON.stringify(validResult()) + "\n```";
    const result = await parseAgentResult(text, FALLBACK_INPUT);

    expect(result.headline).toBe("Send the deck");
  });

  it("parses JSON surrounded by prose", async () => {
    const text = `Sure thing. ${JSON.stringify(validResult())} Let me know.`;
    const result = await parseAgentResult(text, FALLBACK_INPUT);

    expect(result.headline).toBe("Send the deck");
  });
});

describe("parseAgentResult normalization", () => {
  it("derives a headline from the first sentence of the summary", async () => {
    const text = JSON.stringify(
      validResult({ headline: "", summary: "Reply to Dana. Then archive it." }),
    );

    expect((await parseAgentResult(text, FALLBACK_INPUT)).headline).toBe(
      "Reply to Dana",
    );
  });

  it("falls back to a generic headline when there is no summary either", async () => {
    const text = JSON.stringify(validResult({ headline: "", summary: "" }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).headline).toBe(
      "Review required",
    );
  });

  it("maps an unrecognized urgent risk level to high", async () => {
    const text = JSON.stringify(validResult({ riskLevel: "URGENT" }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).riskLevel).toBe("high");
  });

  it("maps an unrecognized minor risk level to low", async () => {
    const text = JSON.stringify(validResult({ riskLevel: "minor issue" }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).riskLevel).toBe("low");
  });

  it("defaults an unrecognized risk level to medium", async () => {
    const text = JSON.stringify(validResult({ riskLevel: "spicy" }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).riskLevel).toBe("medium");
  });

  it("maps a readiness mentioning human review to needs_review", async () => {
    const text = JSON.stringify(
      validResult({ automationReadiness: "needs a human" }),
    );

    expect(
      (await parseAgentResult(text, FALLBACK_INPUT)).automationReadiness,
    ).toBe("needs_review");
  });

  it("maps a readiness mentioning missing data to blocked", async () => {
    const text = JSON.stringify(
      validResult({ automationReadiness: "missing the invoice" }),
    );

    expect(
      (await parseAgentResult(text, FALLBACK_INPUT)).automationReadiness,
    ).toBe("blocked");
  });

  it("clamps confidence above 100", async () => {
    const text = JSON.stringify(validResult({ confidence: 250 }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).confidence).toBe(100);
  });

  it("clamps negative confidence to zero", async () => {
    const text = JSON.stringify(validResult({ confidence: -5 }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).confidence).toBe(0);
  });

  it("rounds a fractional confidence", async () => {
    const text = JSON.stringify(validResult({ confidence: 72.6 }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).confidence).toBe(73);
  });

  it("parses confidence given as a string", async () => {
    const text = JSON.stringify(validResult({ confidence: "64" }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).confidence).toBe(64);
  });

  it("defaults an unparseable confidence to 70", async () => {
    const text = JSON.stringify(validResult({ confidence: "very sure" }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).confidence).toBe(70);
  });

  it("caps suggested tags at six", async () => {
    const tags = Array.from({ length: 10 }, (_value, index) => `tag-${index}`);
    const text = JSON.stringify(validResult({ suggestedTags: tags }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).suggestedTags).toHaveLength(6);
  });

  it("drops non-string and blank tags", async () => {
    const text = JSON.stringify(
      validResult({ suggestedTags: ["deck", "", 7, null, "  "] }),
    );

    expect((await parseAgentResult(text, FALLBACK_INPUT)).suggestedTags).toEqual([
      "deck",
    ]);
  });

  it("caps missing information at five", async () => {
    const items = Array.from({ length: 8 }, (_value, index) => `item-${index}`);
    const text = JSON.stringify(validResult({ missingInformation: items }));

    expect(
      (await parseAgentResult(text, FALLBACK_INPUT)).missingInformation,
    ).toHaveLength(5);
  });

  it("substitutes a review action when the list is empty", async () => {
    const text = JSON.stringify(validResult({ recommendedActions: [] }));
    const result = await parseAgentResult(text, FALLBACK_INPUT);

    expect(result.recommendedActions).toEqual([
      {
        action: "Review the situation",
        owner: "operator",
        detail: "Dana needs the Q3 deck before Friday.",
      },
    ]);
  });

  it("caps recommended actions at five", async () => {
    const actions = Array.from({ length: 9 }, (_value, index) => ({
      action: `Step ${index}`,
      owner: "operator",
      detail: "Do it.",
    }));
    const text = JSON.stringify(validResult({ recommendedActions: actions }));

    expect(
      (await parseAgentResult(text, FALLBACK_INPUT)).recommendedActions,
    ).toHaveLength(5);
  });

  it("accepts title and description as aliases for action and detail", async () => {
    const text = JSON.stringify(
      validResult({
        recommendedActions: [{ title: "Reply", description: "Answer Dana." }],
      }),
    );

    expect(
      (await parseAgentResult(text, FALLBACK_INPUT)).recommendedActions[0],
    ).toEqual({ action: "Reply", owner: "operator", detail: "Answer Dana." });
  });

  it("maps an owner mentioning a bot to automation", async () => {
    const text = JSON.stringify(
      validResult({
        recommendedActions: [{ action: "Label it", owner: "the bot", detail: "x" }],
      }),
    );

    expect(
      (await parseAgentResult(text, FALLBACK_INPUT)).recommendedActions[0].owner,
    ).toBe("automation");
  });

  it("maps an owner mentioning a client to customer", async () => {
    const text = JSON.stringify(
      validResult({
        recommendedActions: [{ action: "Wait", owner: "the client", detail: "x" }],
      }),
    );

    expect(
      (await parseAgentResult(text, FALLBACK_INPUT)).recommendedActions[0].owner,
    ).toBe("customer");
  });

  it("supplies a default draft reply when the model omitted one", async () => {
    const text = JSON.stringify(validResult({ draftReply: "" }));

    expect((await parseAgentResult(text, FALLBACK_INPUT)).draftReply).toBe(
      "Thanks. I reviewed this and will follow up shortly.",
    );
  });
});

describe("parseAgentResult repair pass", () => {
  it("asks the model to repair unparseable output, then uses the repair", async () => {
    createTextCompletion.mockResolvedValue({
      text: JSON.stringify(validResult({ headline: "Repaired" })),
    });

    const result = await parseAgentResult("{ not json at all", FALLBACK_INPUT);

    expect(createTextCompletion).toHaveBeenCalledOnce();
    expect(result.headline).toBe("Repaired");
  });

  it("does not attempt a repair when the first parse succeeds", async () => {
    await parseAgentResult(JSON.stringify(validResult()), FALLBACK_INPUT);

    expect(createTextCompletion).not.toHaveBeenCalled();
  });
});

describe("parseAgentResult fallback", () => {
  it("falls back when neither the original nor the repair parses", async () => {
    createTextCompletion.mockResolvedValue({ text: "still not json" });

    const result = await parseAgentResult("no json here", FALLBACK_INPUT);

    expect(result.riskLevel).toBe("medium");
    expect(result.automationReadiness).toBe("needs_review");
    expect(result.confidence).toBe(55);
    expect(result.recommendedActions).toHaveLength(1);
  });

  it("builds the fallback summary from the context, minus its field labels", async () => {
    createTextCompletion.mockResolvedValue({ text: "" });

    const result = await parseAgentResult("", FALLBACK_INPUT);

    expect(result.summary).toBe(
      "dana@acme.com  needs the Q3 deck by Friday.",
    );
    // The dot inside the address is not a sentence end, so the headline keeps
    // the whole first sentence.
    expect(result.headline).toBe("dana@acme.com  needs the Q3 deck by Friday");
  });

  it("uses a generic summary when there is no context to draw on", async () => {
    createTextCompletion.mockResolvedValue({ text: "" });

    const result = await parseAgentResult("", { task: "Triage", context: "" });

    expect(result.headline).toBe("Manual review required");
    expect(result.summary).toContain("Review the provided context");
  });

  it("falls back when the repair call itself throws", async () => {
    createTextCompletion.mockRejectedValue(new Error("groq unavailable"));

    await expect(parseAgentResult("garbage", FALLBACK_INPUT)).rejects.toThrow(
      "groq unavailable",
    );
  });
});
