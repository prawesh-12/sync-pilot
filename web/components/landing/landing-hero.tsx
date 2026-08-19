import { PendingLink } from "@/components/pending-link";
import { HERO_SUMMARY } from "@/components/landing/landing-content";
import { HeroScene } from "@/components/landing/hero-scene";
import { StatusDot } from "@/components/landing/product-surface";
import {
  landingPrimaryButton,
  landingSecondaryButton,
} from "@/components/landing/landing-button";

export function LandingHero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-12 pb-16 sm:px-6 sm:pt-20 md:pb-24">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="flex items-center gap-2 text-sm text-sp-muted">
            <StatusDot tone="active" breathe />
            Checks Gmail every 5&ndash;15 minutes
          </p>

          <h1 className="mt-6 font-display text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl">
            Reply <span className="text-sp-amber">&ldquo;send.&rdquo;</span>
            <br />
            That&rsquo;s the whole interface.
          </h1>

          <p className="mt-5 max-w-sm text-base leading-relaxed text-sp-muted">
            {HERO_SUMMARY}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PendingLink href="/dashboard" className={landingPrimaryButton}>
              Get Started
            </PendingLink>
            <a href="#decision" className={landingSecondaryButton}>
              See a decision
            </a>
          </div>
        </div>

        <HeroScene />
      </div>
    </section>
  );
}
