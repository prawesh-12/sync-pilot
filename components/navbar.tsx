"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PendingLink } from "@/components/pending-link";
import { cn } from "@/lib/utils";

type NavbarProps = {
    className?: string;
};

export function Navbar({ className }: NavbarProps) {
    const pathname = usePathname();
    const { status } = useSession();
    const isSignedIn = status === "authenticated";

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
                        <>
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
                        </>
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
                            <button
                                type="button"
                                onClick={() => signOut({ redirectTo: "/" })}
                                className="rounded-full border border-[#A089E6]/30 px-4 py-1.5 text-sm text-gray-300 transition-colors hover:border-[#A089E6]/60 hover:text-white"
                            >
                                Sign out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
