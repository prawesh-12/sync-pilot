import type { Metadata } from "next";
import { IBM_Plex_Mono, Work_Sans } from "next/font/google";
import { HERO_SUBHEAD } from "@/components/landing/landing-content";
import { LandingBackdrop } from "@/components/landing/landing-backdrop";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingDecisions } from "@/components/landing/landing-decisions";
import { LandingFacts } from "@/components/landing/landing-facts";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingQuestions } from "@/components/landing/landing-questions";
import { LandingRuntimeCard } from "@/components/landing/landing-runtime-card";
import { LandingSteps } from "@/components/landing/landing-steps";
import { LandingWhySignal } from "@/components/landing/landing-why-signal";

const body = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

const PAGE_TITLE = "SyncPilot — reply “send” to run your inbox";
// Not designed yet, so link shares currently fall back to no preview image.
const OG_IMAGE_PATH = "/og.png";
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const LOCAL_SITE_URL = "http://localhost:3000";

// Absolute OG and Twitter URLs need a real origin, so production must set this.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : LOCAL_SITE_URL);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: PAGE_TITLE,
  description: HERO_SUBHEAD,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SyncPilot",
    title: PAGE_TITLE,
    description: HERO_SUBHEAD,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: "SyncPilot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: HERO_SUBHEAD,
    images: [OG_IMAGE_PATH],
  },
};

export default function Home() {
  return (
    <div
      className={`${body.className} ${body.variable} ${mono.variable} relative flex flex-1 flex-col bg-sp-base text-sp-text`}
    >
      <LandingBackdrop />
      <LandingNav />

      <main className="relative z-10 flex-1">
        <LandingHero />
        <LandingFacts />
        <LandingSteps />
        <LandingDecisions />

        <section className="border-t border-sp-text/8">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-16">
            <LandingWhySignal />
            <LandingRuntimeCard />
          </div>
        </section>

        <LandingQuestions />
        <LandingCta />
      </main>

      <LandingFooter />
    </div>
  );
}
