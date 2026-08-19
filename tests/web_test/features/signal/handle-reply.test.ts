import { beforeEach, describe, expect, it, vi } from "vitest";
import { isSameBody } from "@/features/signal/handle-reply";

// vi.mock is hoisted above all module code, so the mock fns must be created in
// a hoisted block to exist when the factories run.
const m = vi.hoisted(() => ({
  createDraftReply: vi.fn(),
  deleteDraftReply: vi.fn(),
  sendDraftReply: vi.fn(),
  rewriteDraftBody: vi.fn(),
  sendDraftReadyMessage: vi.fn(),
  sendSignalNotice: vi.fn(),
  markEmailDrafted: vi.fn(),
  updatePendingActionPayload: vi.fn(),
  claimPendingAction: vi.fn(),
  releasePendingAction: vi.fn(),
  parseReply: vi.fn(),
}));

const {
  createDraftReply,
  deleteDraftReply,
  sendDraftReply,
  rewriteDraftBody,
  sendDraftReadyMessage,
  sendSignalNotice,
  markEmailDrafted,
  updatePendingActionPayload,
  claimPendingAction,
  releasePendingAction,
  parseReply,
} = m;

vi.mock("@/features/gmail/gmail-drafts", () => ({
  createDraftReply: m.createDraftReply,
  deleteDraftReply: m.deleteDraftReply,
  sendDraftReply: m.sendDraftReply,
}));
vi.mock("@/features/ai/rewrite-draft", () => ({ rewriteDraftBody: m.rewriteDraftBody }));
vi.mock("@/features/signal/signal", () => ({
  sendDraftReadyMessage: m.sendDraftReadyMessage,
  sendSignalNotice: m.sendSignalNotice,
}));
vi.mock("@/db/queries", () => ({
  markEmailDrafted: m.markEmailDrafted,
  updatePendingActionPayload: m.updatePendingActionPayload,
  claimPendingAction: m.claimPendingAction,
  releasePendingAction: m.releasePendingAction,
  recordAgentFeedback: vi.fn(),
}));
vi.mock("@/features/signal/parse-reply", () => ({ parseReply: m.parseReply }));

const { handleSignalReply } = await import("@/features/signal/handle-reply");

const ORIGINAL = "Hi,\n\nThanks for checking in.\n\nBest regards,\nTom";

function pendingRevise(instructions: string) {
  return {
    kind: "draft_revise" as const,
    instructions,
    pending: {
      id: "p1",
      refCode: "S48P",
      gmailMessageId: "m1",
      payload: {
        draftId: "d1",
        body: ORIGINAL,
        connectedAccountId: "c1",
        threadId: "t1",
        replyTo: "sender@example.com",
        subject: "Weekend plans",
      },
    },
  };
}

function pendingSend() {
  return {
    kind: "draft_send" as const,
    pending: {
      id: "p1",
      refCode: "S48P",
      gmailMessageId: "m1",
      payload: {
        draftId: "d1",
        body: ORIGINAL,
        connectedAccountId: "c1",
        threadId: "t1",
        replyTo: "sender@example.com",
        subject: "Weekend plans",
      },
    },
  };
}

describe("isSameBody", () => {
  it("treats whitespace-only differences as unchanged", () => {
    expect(isSameBody("a  b\n", "a b")).toBe(true);
  });

  it("detects real content changes", () => {
    expect(isSameBody("hello there", "hello")).toBe(false);
  });
});

describe("handleSignalReply revise flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createDraftReply.mockResolvedValue("new-draft-id");
  });

  it("keeps the original draft when the revision is empty (null)", async () => {
    parseReply.mockResolvedValue(pendingRevise("gibberish"));
    rewriteDraftBody.mockResolvedValue(null);

    await handleSignalReply("u1", "S48P gibberish");

    expect(createDraftReply).not.toHaveBeenCalled();
    expect(deleteDraftReply).not.toHaveBeenCalled();
    expect(sendSignalNotice).toHaveBeenCalledOnce();
    expect(sendSignalNotice.mock.calls[0][1]).toMatch(/couldn't revise/i);
  });

  it("flags a no-op when the revised body is unchanged", async () => {
    parseReply.mockResolvedValue(pendingRevise("just wait"));
    rewriteDraftBody.mockResolvedValue(ORIGINAL);

    await handleSignalReply("u1", "S48P just wait");

    expect(createDraftReply).not.toHaveBeenCalled();
    expect(sendSignalNotice).toHaveBeenCalledOnce();
    expect(sendSignalNotice.mock.calls[0][1]).toMatch(/didn't change/i);
  });

  it("recreates the draft when the revision actually changes the body", async () => {
    parseReply.mockResolvedValue(pendingRevise("make it shorter"));
    rewriteDraftBody.mockResolvedValue("Short reply.\n\nBest,\nTom");

    await handleSignalReply("u1", "S48P make it shorter");

    expect(deleteDraftReply).toHaveBeenCalledWith(
      { userId: "u1", connectedAccountId: "c1" },
      "d1",
    );
    expect(createDraftReply).toHaveBeenCalledOnce();
    expect(markEmailDrafted).toHaveBeenCalledWith("u1", "m1", "new-draft-id");
    expect(updatePendingActionPayload).toHaveBeenCalledOnce();
    expect(sendDraftReadyMessage).toHaveBeenCalledOnce();
  });
});

describe("handleSignalReply send flow (idempotency)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    parseReply.mockResolvedValue(pendingSend());
  });

  it("sends and confirms when it wins the claim", async () => {
    claimPendingAction.mockResolvedValue(true);
    sendDraftReply.mockResolvedValue(undefined);

    await handleSignalReply("u1", "S48P send");

    expect(claimPendingAction).toHaveBeenCalledWith("p1", "confirmed");
    expect(sendDraftReply).toHaveBeenCalledOnce();
    expect(sendSignalNotice.mock.calls[0][1]).toMatch(/sent your reply/i);
  });

  it("skips sending when the claim was already taken (retry of a sent draft)", async () => {
    claimPendingAction.mockResolvedValue(false);

    await handleSignalReply("u1", "S48P send");

    expect(sendDraftReply).not.toHaveBeenCalled();
    expect(sendSignalNotice).not.toHaveBeenCalled();
  });

  it("keeps the claim and warns the user on a send timeout (at-most-once)", async () => {
    claimPendingAction.mockResolvedValue(true);
    sendDraftReply.mockRejectedValue(new Error("Composio tool GMAIL_SEND timed out after 30000ms."));

    await expect(handleSignalReply("u1", "S48P send")).resolves.toBeUndefined();

    expect(releasePendingAction).not.toHaveBeenCalled();
    expect(sendSignalNotice.mock.calls[0][1]).toMatch(/check your gmail sent folder/i);
  });

  it("releases the claim and rethrows on a clean send failure (so it retries)", async () => {
    claimPendingAction.mockResolvedValue(true);
    sendDraftReply.mockRejectedValue(new Error("Composio tool GMAIL_SEND execution failed."));

    await expect(handleSignalReply("u1", "S48P send")).rejects.toThrow(/execution failed/);

    expect(releasePendingAction).toHaveBeenCalledWith("p1");
  });
});
