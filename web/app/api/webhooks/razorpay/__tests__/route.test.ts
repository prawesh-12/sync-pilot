import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  verifyRazorpayWebhookSignature: vi.fn(),
  claimWebhookEvent: vi.fn(),
  setUserPlan: vi.fn(),
  updateSubscriptionByRazorpayId: vi.fn(),
}));

vi.mock("@/lib/razorpay", () => ({
  verifyRazorpayWebhookSignature: h.verifyRazorpayWebhookSignature,
}));
vi.mock("@/db/queries", () => ({
  claimWebhookEvent: h.claimWebhookEvent,
  setUserPlan: h.setUserPlan,
  updateSubscriptionByRazorpayId: h.updateSubscriptionByRazorpayId,
}));

const { POST } = await import("@/app/api/webhooks/razorpay/route");

function webhookRequest(eventId = "evt_123") {
  const body = JSON.stringify({
    event: "subscription.charged",
    payload: { subscription: { entity: { id: "sub_1", current_end: 1700000000 } } },
  });

  return new Request("http://localhost/api/webhooks/razorpay", {
    method: "POST",
    headers: {
      "x-razorpay-signature": "sig",
      "x-razorpay-event-id": eventId,
    },
    body,
  });
}

describe("razorpay webhook POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.verifyRazorpayWebhookSignature.mockReturnValue(true);
    h.updateSubscriptionByRazorpayId.mockResolvedValue({ userId: "u1" });
  });

  it("rejects an invalid signature with 401", async () => {
    h.verifyRazorpayWebhookSignature.mockReturnValue(false);

    const res = await POST(webhookRequest());

    expect(res.status).toBe(401);
    expect(h.claimWebhookEvent).not.toHaveBeenCalled();
  });

  it("applies the plan on the first delivery", async () => {
    h.claimWebhookEvent.mockResolvedValue(true);

    const res = await POST(webhookRequest());

    expect(await res.json()).toEqual({ ok: true });
    expect(h.updateSubscriptionByRazorpayId).toHaveBeenCalledOnce();
    expect(h.setUserPlan).toHaveBeenCalledWith("u1", "pro");
  });

  it("is a no-op on a duplicate delivery", async () => {
    h.claimWebhookEvent.mockResolvedValue(false);

    const res = await POST(webhookRequest());

    expect(await res.json()).toEqual({ ok: true, duplicate: true });
    expect(h.updateSubscriptionByRazorpayId).not.toHaveBeenCalled();
    expect(h.setUserPlan).not.toHaveBeenCalled();
  });
});
