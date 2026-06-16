import { createHmac, timingSafeEqual } from "node:crypto";
import { getRazorpayConfig, getRazorpayWebhookSecret } from "@/config/env";
import { PRO_PLAN_TOTAL_BILLING_CYCLES } from "@/config/plans";

const RAZORPAY_SUBSCRIPTIONS_URL = "https://api.razorpay.com/v1/subscriptions";
const NOTIFY_CUSTOMER = 1;
const MILLISECONDS_PER_SECOND = 1000;

export type RazorpaySubscription = {
  id: string;
  status: string;
  shortUrl: string | null;
  currentPeriodEnd: Date | null;
};

// Creates a Razorpay subscription via REST so we avoid pulling in the SDK.
export async function createRazorpaySubscription(): Promise<RazorpaySubscription> {
  const { keyId, keySecret, planId } = getRazorpayConfig();
  const authHeader = buildBasicAuthHeader(keyId, keySecret);

  const response = await fetch(RAZORPAY_SUBSCRIPTIONS_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      total_count: PRO_PLAN_TOTAL_BILLING_CYCLES,
      customer_notify: NOTIFY_CUSTOMER,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Razorpay subscription create failed (${response.status}).`);
  }

  return mapSubscription(await response.json());
}

// Verifies the X-Razorpay-Signature header against the raw request body.
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) {
    return false;
  }

  const expected = createHmac("sha256", getRazorpayWebhookSecret())
    .update(rawBody)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function buildBasicAuthHeader(keyId: string, keySecret: string) {
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  return `Basic ${token}`;
}

function mapSubscription(data: unknown): RazorpaySubscription {
  const record = (data ?? {}) as Record<string, unknown>;
  const currentEnd =
    typeof record.current_end === "number" ? record.current_end : null;

  return {
    id: String(record.id ?? ""),
    status: String(record.status ?? "created"),
    shortUrl: typeof record.short_url === "string" ? record.short_url : null,
    currentPeriodEnd: currentEnd
      ? new Date(currentEnd * MILLISECONDS_PER_SECOND)
      : null,
  };
}
