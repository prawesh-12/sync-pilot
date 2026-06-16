import { getSubscription, getUserPlan } from "@/db/queries";
import { PRO_PLAN_PRICE_INR } from "@/config/plans";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";

type BillingCardProps = {
  userId: string;
};

export async function BillingCard({ userId }: BillingCardProps) {
  const [plan, subscription] = await Promise.all([
    getUserPlan(userId),
    getSubscription(userId),
  ]);
  const isPro = plan === "pro";
  const nextBilling = formatDate(subscription?.currentPeriodEnd ?? null);

  return (
    <div className="shrink-0 flex flex-col gap-3 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3">
      <div>
        <h2 className="text-lg font-semibold text-white">Billing</h2>
        <p className="mt-0.5 text-xs text-gray-400">
          {isPro ? "Plan: Pro" : "Plan: Free"}
          {isPro && nextBilling ? ` · Next billing: ${nextBilling}` : ""}
        </p>
      </div>

      {isPro ? (
        <span className="self-start shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200 sm:self-auto">
          Pro active
        </span>
      ) : (
        <UpgradeButton priceInr={PRO_PLAN_PRICE_INR} />
      )}
    </div>
  );
}

function formatDate(value: Date | null) {
  if (!value) {
    return "";
  }

  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
