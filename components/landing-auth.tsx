"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PendingLink } from "@/components/pending-link";

export function LandingAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setIsSignedIn(Boolean(data.signedIn));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsSignedIn(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <PendingLink
          href="/dashboard"
          className="group flex items-center gap-2 rounded-full bg-[#A089E6]/10 px-5 py-1.5 text-sm font-semibold text-[#A089E6] transition-colors hover:bg-[#A089E6]/20"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </PendingLink>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <PendingLink
        href="/sign-in"
        className="px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
      >
        Sign in
      </PendingLink>
      <PendingLink
        href="/sign-up"
        className="rounded-full bg-[#A089E6] px-5 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-[#8b6fd4]"
      >
        Sign up
      </PendingLink>
    </div>
  );
}
