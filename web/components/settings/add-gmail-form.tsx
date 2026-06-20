"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

// Starts the Composio Gmail OAuth flow. This is a plain GET navigation (not a
// server action), so we track pending state ourselves and show a spinner until
// the browser leaves the page for the OAuth redirect.
export function AddGmailForm({ returnTo }: { returnTo: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      method="get"
      action="/api/auth/composio"
      onSubmit={() => setPending(true)}
      className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="flex-1 space-y-1">
        <label htmlFor="gmailLabel" className="text-xs text-muted-foreground">
          Label (optional)
        </label>
        <Input id="gmailLabel" name="label" placeholder="Work Gmail" maxLength={40} />
      </div>
      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full sm:w-auto"
      >
        {pending ? <Spinner className="size-4" /> : "Add Gmail account"}
      </Button>
    </form>
  );
}
