import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Work_Sans } from "next/font/google";
import "./globals.css";

// One typeface set for the whole product, loaded at the root so the landing
// theme is the app theme.

// Body copy. Bound to --font-sans, which the base layer applies to <html>.
const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Headings and the wordmark.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Labels, codes, and anything that should read as machine output.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SyncPilot - AI Agent",
  description: "SyncPilot control dashboard",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: '5RGlqHrGNBCKAd7BMg6NZAPUjIORTBLDDt1jytqGGQQ',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The landing page tags <html> with sp-js from an inline script during
    // parsing, so the server class list can never match the client's. That is
    // intended — the class is what proves scripting ran — and without
    // suppressHydrationWarning React logs a mismatch on every load. It covers
    // this element's own attributes only, not its descendants.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${workSans.variable} ${bricolage.variable} ${plexMono.variable} dark`}
    >
      {/* Base surface set here rather than per page. */}
      <body
        className={`${workSans.className} flex min-h-screen flex-col overflow-x-hidden bg-sp-base text-sp-text antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

