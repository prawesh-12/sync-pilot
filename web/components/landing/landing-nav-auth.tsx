"use client";

import { useEffect, useState } from "react";
import { PendingLink } from "@/components/pending-link";
import { landingNavButton } from "@/components/landing/landing-button";

export function LandingNavAuth() {
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

  return (
    <PendingLink
      href={isSignedIn ? "/dashboard" : "/sign-in"}
      className={`${landingNavButton} shrink-0 whitespace-nowrap`}
    >
      {isSignedIn ? "Dashboard" : "Get Started"}
    </PendingLink>
  );
}
