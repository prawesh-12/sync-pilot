import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createRazorpaySubscription } from "@/lib/razorpay";
import { saveSubscription, upsertUser } from "@/db/queries";
import { scopedLogger } from "@/lib/logger";

export const runtime = "nodejs";

const log = scopedLogger("BILLING");

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;

  if (!userId || !email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const subscription = await createRazorpaySubscription();

    // Record intent only; the user's plan flips to "pro" via the webhook
    // after Razorpay confirms payment.
    await upsertUser({ id: userId, email });
    await saveSubscription(userId, {
      razorpaySubscriptionId: subscription.id,
      plan: "pro",
      status: "created",
      currentPeriodEnd: subscription.currentPeriodEnd,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.shortUrl,
    });
  } catch (error) {
    log.error({ err: error }, "failed to create subscription");

    return NextResponse.json(
      { error: "Could not start checkout." },
      { status: 500 },
    );
  }
}
