"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type UpgradeButtonProps = {
  priceInr: number;
};

export function UpgradeButton({ priceInr }: UpgradeButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setIsPending(true);
    setError("");

    try {
      const response = await fetch("/api/billing/subscribe", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data.shortUrl) {
        throw new Error(data.error || "Could not start checkout.");
      }

      window.location.href = data.shortUrl;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not start checkout.",
      );
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={startCheckout} disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <Spinner className="size-4" />
        ) : (
          `Upgrade to Pro — ₹${priceInr}/month`
        )}
      </Button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
