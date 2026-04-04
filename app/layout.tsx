import type { Metadata } from "next";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { Button } from "@/components/ui/button";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncPilot - AI Agent",
  description: "SyncPilot control dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} dark`}>
      <body className={`${montserrat.className} h-screen overflow-hidden flex flex-col antialiased`}>
        <ClerkProvider>
          <header className="border-b border-[#A089E6]/10 bg-[#07070f]/90 backdrop-blur-sm">
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
                    className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="text-sm font-semibold bg-[#A089E6] text-black rounded-full px-5 py-1.5 hover:bg-[#8b6fd4] transition-colors"
                  >
                    Sign up
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
                  >
                    Dashboard
                  </Link>
                  <UserButton />
                </Show>
              </div>
            </div>
          </header>
          {children}
          <footer className="border-t border-[#A089E6]/10 bg-[#07070f]/90 py-3 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} SyncPilot AI · Built with Next.js · Clerk · Groq · Signal
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
