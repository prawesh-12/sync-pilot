import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ActionsSection } from "@/components/landing/actions-section";
import { ClosingSection } from "@/components/landing/closing-section";
import { CommandsSection } from "@/components/landing/commands-section";
import { FaqSection } from "@/components/landing/faq-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { HERO_SUMMARY } from "@/components/landing/landing-content";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { PricingSection } from "@/components/landing/pricing-section";
import { PrivacySection } from "@/components/landing/privacy-section";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const PAGE_TITLE = "SyncPilot - An agent that manages your email";
const OG_IMAGE_PATH = "/og.jpg";
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const LOCAL_SITE_URL = "http://localhost:3000";

// Production must set this; link previews need an absolute origin.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : LOCAL_SITE_URL);

// Without JavaScript, reveals never hide and content stays visible.
const REVEAL_GATE_SCRIPT =
  "if(typeof IntersectionObserver!=='undefined'){document.documentElement.classList.add('sp-js')}";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: PAGE_TITLE,
  description: HERO_SUMMARY,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SyncPilot",
    title: PAGE_TITLE,
    description: HERO_SUMMARY,
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
    description: HERO_SUMMARY,
    images: [OG_IMAGE_PATH],
  },
};

export default function Home() {
  return (
    <div className={`${inter.variable} quiet flex flex-1 flex-col antialiased`}>
      <script dangerouslySetInnerHTML={{ __html: REVEAL_GATE_SCRIPT }} />
      <LandingNav />

      <main className="flex-1">
        <LandingHero />
        <HowItWorksSection />
        <ActionsSection />
        <CommandsSection />
        <PrivacySection />
        <PricingSection />
        <FaqSection />
        <ClosingSection />
      </main>

      <LandingFooter />
    </div>
  );
}
