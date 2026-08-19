import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

const WEBHOOK_SECRET = "test_webhook_secret";

// verifyRazorpayWebhookSignature reads the secret from config/env; stub it.
vi.mock("@/config/env", () => ({
  getRazorpayWebhookSecret: () => WEBHOOK_SECRET,
  getRazorpayConfig: () => ({ keyId: "", keySecret: "", planId: "" }),
}));

const { verifyRazorpayWebhookSignature } = await import("@/lib/razorpay");

function sign(body: string, secret = WEBHOOK_SECRET): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyRazorpayWebhookSignature", () => {
  const body = JSON.stringify({ event: "subscription.charged" });

  it("accepts a correctly signed body", () => {
    expect(verifyRazorpayWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a tampered body", () => {
    expect(verifyRazorpayWebhookSignature(body + "x", sign(body))).toBe(false);
  });

  it("rejects a signature made with the wrong secret", () => {
    expect(verifyRazorpayWebhookSignature(body, sign(body, "wrong"))).toBe(false);
  });

  it("rejects a missing signature header", () => {
    expect(verifyRazorpayWebhookSignature(body, null)).toBe(false);
  });
});
