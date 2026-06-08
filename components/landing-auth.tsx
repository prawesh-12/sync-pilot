"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ctaButtonClass } from "@/components/cta-button-class";
import { PendingLink } from "@/components/pending-link";
import { cn } from "@/lib/utils";

const navCtaClass = cn(ctaButtonClass, "px-4 py-2 text-sm");

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
        Go to Dashboard
        <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
      </PendingLink>
    );
  }

  return (
    <PendingLink href="/sign-in" className={navCtaClass}>
      Sign in
      <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
    </PendingLink>
  );
}
