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
      <body className={`${montserrat.className} min-h-screen antialiased`}>
        <ClerkProvider>
          <header className="border-b border-border/80 bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Link
                href="/"
                className="text-sm font-semibold uppercase tracking-[0.28em] text-foreground/80"
              >
                SyncPilot
              </Link>

              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <Button asChild variant="ghost">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </Show>
                <Show when="signed-in">
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <UserButton />
                </Show>
              </div>
            </div>
          </header>
          {children}
          <footer className="footer-wrapper">
            <div className="section-heading">
              <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} SyncPilot Ai
              </p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
