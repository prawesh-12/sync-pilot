import { ArrowRight } from "lucide-react";
import { PendingLink } from "@/components/pending-link";
import { landingPrimaryButton } from "@/components/landing/landing-button";

const ARROW_SIZE = 17;

export function LandingCta() {
  return (
    <section className="border-t border-sp-text/8">
      <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-6 md:py-28">
        <h2 className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-[2.6rem]">
          Connect Gmail, link Signal, and start replying to your inbox in four
          characters.
        </h2>
        <div className="mt-8 flex justify-center">
          <PendingLink href="/dashboard" className={landingPrimaryButton}>
            Get Started
            <ArrowRight size={ARROW_SIZE} strokeWidth={2.2} aria-hidden="true" />
          </PendingLink>
        </div>
        <p className="mt-5 font-mono-tech text-[12.5px] text-sp-muted">
          Free to use today &middot; Pro coming soon
        </p>
      </div>
    </section>
  );
}
