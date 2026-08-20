"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

// Starts the Composio Gmail OAuth flow. This is a plain GET navigation (not a
// server action), so we track pending state ourselves and show a spinner until
// the browser leaves the page for the OAuth redirect.

// Long enough for a slow redirect, short enough that a failed one recovers.
const PENDING_TIMEOUT_MS = 15000;

export function AddGmailForm({ returnTo }: { returnTo: string }) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const stop = () => setIsPending(false);

    // Coming back from the provider restores this page from the back/forward
    // cache with its state intact, so the spinner has to be cleared by hand.
    const stopOnRestore = (event: PageTransitionEvent) => {
      if (event.persisted) {
        stop();
      }
    };

    const stopWhenVisible = () => {
      if (document.visibilityState === "visible") {
        stop();
      }
    };

    const timer = window.setTimeout(stop, PENDING_TIMEOUT_MS);
    window.addEventListener("pageshow", stopOnRestore);
    document.addEventListener("visibilitychange", stopWhenVisible);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", stopOnRestore);
      document.removeEventListener("visibilitychange", stopWhenVisible);
    };
  }, [isPending]);

  return (
    <form
      method="get"
      action="/api/auth/composio"
      onSubmit={() => setIsPending(true)}
      className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="flex-1 space-y-1">
        <label htmlFor="gmailLabel" className="text-xs text-muted-foreground">
          Label (optional)
        </label>
        <Input
          id="gmailLabel"
          name="label"
          placeholder="Work Gmail"
          maxLength={40}
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Spinner className="size-4" />
            Connecting
          </>
        ) : (
          "Add Gmail account"
        )}
      </Button>
    </form>
  );
}
