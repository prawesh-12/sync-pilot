"use client";

import { useEffect, useState } from "react";
import { PendingLink } from "@/components/pending-link";
import { GITHUB_URL } from "@/components/landing/landing-content";
import { Icon, navButton } from "@/components/landing/landing-ui";

const AUTH_STATUS_URL = "/api/auth/status";
const GITHUB_ICON_SIZE = 18;

function GithubLink() {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="SyncPilot on GitHub"
      className="flex size-8 items-center justify-center rounded-full text-q-fg-3 transition-colors duration-100 hover:bg-white/[0.06] hover:text-q-fg"
    >
      <Icon name="Github" size={GITHUB_ICON_SIZE} />
    </a>
  );
}

export function LandingNavActions() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch(AUTH_STATUS_URL)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setIsSignedIn(Boolean(data.signedIn));
        }
      })
      .catch((error: unknown) => {
        console.error("Landing nav could not read auth status", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <GithubLink />
      {isSignedIn ? (
        <PendingLink href="/dashboard" className={navButton}>
          Open dashboard
        </PendingLink>
      ) : (
        <PendingLink href="/sign-in" className={navButton}>
          Log in
        </PendingLink>
      )}
    </div>
  );
}
