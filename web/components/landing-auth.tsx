"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ctaButtonClass } from "@/components/cta-button-class";
import { PendingLink } from "@/components/pending-link";
import { cn } from "@/lib/utils";

const navCtaClass = cn(
  ctaButtonClass,
  "shrink-0 whitespace-nowrap px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm",
);

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
      <PendingLink href="/dashboard" className={navCtaClass}>
        Dashboard
        <ArrowRight size={16} strokeWidth={2.5} className="hidden transition-transform group-hover:translate-x-0.5 sm:block" />
      </PendingLink>
    );
  }

  return (
    <PendingLink href="/sign-in" className={navCtaClass}>
      Sign in
      <ArrowRight size={16} strokeWidth={2.5} className="hidden transition-transform group-hover:translate-x-0.5 sm:block" />
    </PendingLink>
  );
}
