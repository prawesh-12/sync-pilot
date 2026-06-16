"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ConnectGoogleButtonProps = {
  returnTo: string;
  label?: string;
  className?: string;
};

export function ConnectGoogleButton({
  returnTo,
  label = "Connect Google Account",
  className,
}: ConnectGoogleButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const href = `/api/auth/composio?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <a
      href={href}
      onClick={() => setIsPending(true)}
      aria-busy={isPending}
      className={cn(
        buttonVariants({ variant: "default" }),
        isPending && "pointer-events-none",
        className,
      )}
    >
      {isPending ? <Spinner className="size-4" /> : label}
    </a>
  );
}
