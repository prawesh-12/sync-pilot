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
                "sticky top-0 z-50 border-b border-[#A089E6]/10 bg-[#07070f]/90 backdrop-blur-sm",
                className,
            )}
        >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <BrandLogo />

                <div className="flex items-center gap-3">
                    {!isSignedIn ? (
                        <PendingLink href="/sign-in" className={cn(ctaButtonClass, "px-4 py-2 text-sm")}>
                            Sign in
                            <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                        </PendingLink>
                    ) : (
                        <>
                            {!pathname.startsWith("/dashboard") ? (
                                <PendingLink
                                    href="/dashboard"
                                    className="px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                                >
                                    Dashboard
                                </PendingLink>
                            ) : null}
                            {!pathname.startsWith("/agent") ? (
                                <PendingLink
                                    href="/agent"
                                    className="px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                                >
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
                                    "inline-flex items-center gap-2 px-4 py-1.5 text-sm disabled:opacity-70",
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
