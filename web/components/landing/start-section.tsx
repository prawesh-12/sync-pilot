import { ArrowRight } from "lucide-react";
import { PendingLink } from "@/components/pending-link";
import { ONBOARDING_STEPS } from "@/components/landing/landing-content";
import { Meta } from "@/components/landing/product-surface";
import { landingPrimaryButton } from "@/components/landing/landing-button";

const ARROW_SIZE = 15;

function SetupStep({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-white/7 py-4">
      <div>
        <p className="text-base text-sp-text">{name}</p>
        <p className="mt-0.5 text-xs text-sp-muted">{detail}</p>
      </div>
      <Meta className="shrink-0 tracking-[0.12em] uppercase">Not connected</Meta>
    </div>
  );
}

export function StartSection() {
  return (
    <section className="px-5 pt-8 pb-20 sm:px-6 md:pt-12 md:pb-28">
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Two connections, then it runs.
        </h2>
        <div className="mt-7">
          {ONBOARDING_STEPS.map((step) => (
            <SetupStep key={step.name} name={step.name} detail={step.detail} />
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <PendingLink href="/dashboard" className={landingPrimaryButton}>
            Get Started
            <ArrowRight size={ARROW_SIZE} strokeWidth={2.2} aria-hidden="true" />
          </PendingLink>
          <span className="text-sm text-sp-muted">
            Free to use today.
          </span>
        </div>
      </div>
    </section>
  );
}
