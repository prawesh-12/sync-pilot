"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavbarProps = {
    className?: string;
};

export function Navbar({ className }: NavbarProps) {
    const pathname = usePathname();

    return (
        <header
            className={cn(
                "sticky top-0 z-50 border-b border-[#A089E6]/10 bg-[#07070f]/90 backdrop-blur-sm",
                className,
            )}
        >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <Link
                    href="/"
                    className="text-sm font-semibold uppercase tracking-[0.28em] text-white"
                >
                    SyncPilot
                </Link>

                <div className="flex items-center gap-3">
                    <Show when="signed-out">
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
                    </Show>
                    <Show when="signed-in">
                        {!pathname.startsWith("/dashboard") ? (
                            <Link
                                href="/dashboard"
                                className="px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                            >
                                Dashboard
                            </Link>
                        ) : null}
                        <UserButton />
                    </Show>
                </div>
            </div>
        </header>
    );
}
