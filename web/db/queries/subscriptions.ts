import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  subscriptions,
  users,
  type PlanValue,
  type SubscriptionStatusValue,
} from "@/db/schema";

type SaveSubscriptionInput = {
  razorpaySubscriptionId: string;
  plan: PlanValue;
  status: SubscriptionStatusValue;
  currentPeriodEnd: Date | null;
};

type UpdateSubscriptionInput = {
  status: SubscriptionStatusValue;
  plan?: PlanValue;
  currentPeriodEnd?: Date | null;
};

export const getUserPlan = cache(async function getUserPlan(
  userId: string,
): Promise<PlanValue> {
  const db = getDb();
  const [row] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.plan ?? "free";
});

export const getSubscription = cache(async function getSubscription(
  userId: string,
) {
  const db = getDb();
  const [row] = await db
    .select({
      id: subscriptions.id,
      plan: subscriptions.plan,
      status: subscriptions.status,
      razorpaySubscriptionId: subscriptions.razorpaySubscriptionId,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return row ?? null;
});

export async function saveSubscription(
  userId: string,
  input: SaveSubscriptionInput,
) {
  const db = getDb();
  const [row] = await db
    .insert(subscriptions)
    .values({
      userId,
      plan: input.plan,
      status: input.status,
      razorpaySubscriptionId: input.razorpaySubscriptionId,
      currentPeriodEnd: input.currentPeriodEnd,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        plan: input.plan,
        status: input.status,
        razorpaySubscriptionId: input.razorpaySubscriptionId,
        currentPeriodEnd: input.currentPeriodEnd,
      },
    })
    .returning();

  return row;
}

export async function updateSubscriptionByRazorpayId(
  razorpaySubscriptionId: string,
  input: UpdateSubscriptionInput,
) {
  const db = getDb();
  const [row] = await db
    .update(subscriptions)
    .set({
      status: input.status,
      ...(input.plan ? { plan: input.plan } : {}),
      ...(input.currentPeriodEnd !== undefined
        ? { currentPeriodEnd: input.currentPeriodEnd }
        : {}),
    })
    .where(eq(subscriptions.razorpaySubscriptionId, razorpaySubscriptionId))
    .returning({ userId: subscriptions.userId });

  return row ?? null;
}
