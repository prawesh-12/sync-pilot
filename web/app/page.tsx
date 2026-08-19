import type { Metadata } from "next";
import { HERO_SUMMARY } from "@/components/landing/landing-content";
import { CommandsSection } from "@/components/landing/commands-section";
import { DecisionsSection } from "@/components/landing/decisions-section";
import { FaqSection } from "@/components/landing/faq-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingBackdrop } from "@/components/site-backdrop";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { Panel } from "@/components/landing/layout-primitives";
import { SectionIndicator } from "@/components/landing/section-indicator";
import { ScrollSnap } from "@/components/landing/scroll-snap";
import { PricingSection } from "@/components/landing/pricing-section";
import { StartSection } from "@/components/landing/start-section";
import { WhySection } from "@/components/landing/why-section";

const PAGE_TITLE = "SyncPilot: reply “send” to run your inbox";
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
    <div className="relative flex flex-1 flex-col">
      {/* Reveals only hide themselves once this lands, so a browser without JS
          or without IntersectionObserver shows every section outright. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "if(typeof IntersectionObserver!=='undefined'){document.documentElement.classList.add('sp-js')}",
        }}
      />
      <ScrollSnap />
      <SectionIndicator />
      <LandingBackdrop />
      <LandingNav />

      <main className="relative z-10 flex-1">
        <LandingHero />
        <WhySection />
        <HowItWorksSection />
        <CommandsSection />
        <DecisionsSection />
        <PricingSection />
        <FaqSection />
      </main>

      {/* The page's last snap stop: the call to action and the footer share
          one panel, because a footer on its own is not worth a scroll of its
          own. It sits outside <main> so the footer keeps its contentinfo
          landmark, which a footer nested in <main> would lose. */}
      <Panel end label="Get started" className="relative z-10">
        <StartSection />
        <LandingFooter />
      </Panel>
    </div>
  );
}
