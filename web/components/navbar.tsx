"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ctaButtonClass, ctaButtonTheme } from "@/components/cta-button-class";
import { PendingLink } from "@/components/pending-link";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// Matches the landing nav: opaque at every scroll position, one hairline rule,
// and the shared page container so the logo lines up across the whole product.
const navLinkClass =
  "sp-focus shrink-0 rounded-[6px] px-1 text-sm leading-normal whitespace-nowrap text-sp-muted transition-colors duration-150 hover:text-sp-text sm:text-base";

type NavbarProps = {
    className?: string;
};

export function Navbar({ className }: NavbarProps) {
    const pathname = usePathname();
    const { status } = useSession();
    const isSignedIn = status === "authenticated";
    const [isSigningOut, setIsSigningOut] = useState(false);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 border-b border-white/8 bg-sp-base",
                className,
            )}
        >
            <div className="sp-container flex items-center justify-between gap-3 py-2.5 sm:gap-6 sm:py-4">
                <BrandLogo />

                <div className="flex shrink-0 items-center gap-3 sm:gap-6">
                    {!isSignedIn ? (
                        <PendingLink href="/sign-in" className={cn(ctaButtonClass, "shrink-0 px-3 py-1.5 text-xs whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm")}>
                            Sign in
                            <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                        </PendingLink>
                    ) : (
                        <>
                            {!pathname.startsWith("/dashboard") ? (
                                <PendingLink href="/dashboard" className={navLinkClass}>
                                    Dashboard
                                </PendingLink>
                            ) : null}
                            {!pathname.startsWith("/agent") ? (
                                <PendingLink href="/agent" className={navLinkClass}>
                                    Agent
                                </PendingLink>
                            ) : null}
                            <button
                                type="button"
                                disabled={isSigningOut}
                                aria-busy={isSigningOut}
                                onClick={() => {
                                    setIsSigningOut(true);
                                    void signOut({ redirectTo: "/" });
                                }}
                                className={cn(
                                    ctaButtonTheme,
                                    "inline-flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs whitespace-nowrap sm:px-4 sm:text-sm disabled:opacity-70",
                                )}
                            >
                                {isSigningOut ? (
                                    <>
                                        <Spinner className="size-4" />
                                        Signing out
                                    </>
                                ) : (
                                    "Sign out"
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
