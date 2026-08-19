import { ArrowRight } from "lucide-react";
import { PendingLink } from "@/components/pending-link";
import { HERO_SUBHEAD } from "@/components/landing/landing-content";
import { SignalThread } from "@/components/landing/signal-thread";
import {
  landingPrimaryButton,
  landingSecondaryButton,
} from "@/components/landing/landing-button";

const ARROW_SIZE = 17;

export function LandingHero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-6 sm:pt-20 md:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <div>
          <h1 className="font-display text-[2.1rem] leading-[1.06] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
            Reply <span className="text-sp-amber">&ldquo;send.&rdquo;</span>
            <br />
            That&rsquo;s the whole interface.
          </h1>

          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-sp-muted sm:mt-6 sm:text-base">
            {HERO_SUBHEAD}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
            <PendingLink href="/dashboard" className={landingPrimaryButton}>
              Get Started
              <ArrowRight size={ARROW_SIZE} strokeWidth={2.2} aria-hidden="true" />
            </PendingLink>
            <a href="#how-it-works" className={landingSecondaryButton}>
              See how it works
            </a>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <SignalThread />
        </div>
      </div>
    </section>
  );
}
