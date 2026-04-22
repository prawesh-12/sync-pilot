"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingAuth() {
  const [authStatus, setAuthStatus] = useState<"loading" | "signed-in" | "signed-out">("loading");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setAuthStatus(data.signedIn ? "signed-in" : "signed-out");
        }
      })
      .catch(() => {
        if (isMounted) setAuthStatus("signed-out");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (authStatus === "loading") {
    return (
      <div className="flex items-center gap-3">
        <Skeleton width="60px" height="32px" rounded="rounded-full" className="bg-[#A089E6]/20" />
        <Skeleton width="80px" height="32px" rounded="rounded-full" className="bg-[#A089E6]/20" />
      </div>
    );
  }

  if (authStatus === "signed-in") {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 rounded-full bg-[#A089E6]/10 px-5 py-1.5 text-sm font-semibold text-[#A089E6] transition-colors hover:bg-[#A089E6]/20"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/sign-in"
        className="px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="rounded-full bg-[#A089E6] px-5 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-[#8b6fd4]"
      >
        Sign up
      </Link>
    </div>
  );
}
