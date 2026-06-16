import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createRazorpaySubscription } from "@/lib/razorpay";
import { saveSubscription, upsertUser } from "@/db/queries";

export const runtime = "nodejs";

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
    console.error("[BILLING] Failed to create subscription");
    console.error(error);

    return NextResponse.json(
      { error: "Could not start checkout." },
      { status: 500 },
    );
  }
}
