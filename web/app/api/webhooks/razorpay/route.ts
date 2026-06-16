import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { setUserPlan, updateSubscriptionByRazorpayId } from "@/db/queries";
import type { SubscriptionStatusValue } from "@/db/schema";

export const runtime = "nodejs";

const MILLISECONDS_PER_SECOND = 1000;
const ACTIVE_EVENTS = new Set([
  "subscription.charged",
  "subscription.activated",
  "subscription.authenticated",
]);
const ENDED_EVENTS = new Set([
  "subscription.cancelled",
  "subscription.completed",
  "subscription.expired",
  "subscription.halted",
]);

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    await handleEvent(JSON.parse(rawBody));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[BILLING] Razorpay webhook handling failed");
    console.error(error);

    return NextResponse.json(
      { error: "Webhook handling failed." },
      { status: 500 },
    );
  }
}

async function handleEvent(payload: unknown) {
  const event = readEvent(payload);
  const entity = readSubscriptionEntity(payload);
  const subscriptionId = entity ? String(entity.id ?? "") : "";

  if (!subscriptionId) {
    return;
  }

  if (ACTIVE_EVENTS.has(event)) {
    await applyPlan(subscriptionId, "pro", "active", readPeriodEnd(entity));
    return;
  }

  if (ENDED_EVENTS.has(event)) {
    const status: SubscriptionStatusValue =
      event === "subscription.cancelled" || event === "subscription.halted"
        ? "cancelled"
        : "expired";
    await applyPlan(subscriptionId, "free", status, null);
  }
}

async function applyPlan(
  subscriptionId: string,
  plan: "free" | "pro",
  status: SubscriptionStatusValue,
  currentPeriodEnd: Date | null,
) {
  const row = await updateSubscriptionByRazorpayId(subscriptionId, {
    status,
    plan,
    currentPeriodEnd,
  });

  if (row) {
    await setUserPlan(row.userId, plan);
  }
}

function readEvent(payload: unknown): string {
  const record = (payload ?? {}) as Record<string, unknown>;

  return typeof record.event === "string" ? record.event : "";
}

function readSubscriptionEntity(
  payload: unknown,
): Record<string, unknown> | null {
  const record = (payload ?? {}) as Record<string, unknown>;
  const container = (record.payload ?? {}) as Record<string, unknown>;
  const subscription = (container.subscription ?? {}) as Record<string, unknown>;
  const entity = subscription.entity;

  return entity && typeof entity === "object"
    ? (entity as Record<string, unknown>)
    : null;
}

function readPeriodEnd(entity: Record<string, unknown> | null): Date | null {
  const currentEnd = entity?.current_end;

  return typeof currentEnd === "number"
    ? new Date(currentEnd * MILLISECONDS_PER_SECOND)
    : null;
}
