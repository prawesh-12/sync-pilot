import { ArrowRight } from "lucide-react";
import { PendingLink } from "@/components/pending-link";
import { GmailMark, SignalMark } from "@/components/landing/brand-marks";
import { ONBOARDING_STEPS } from "@/components/landing/landing-content";
import { ICON_SIZE_SM, ICON_STROKE } from "@/components/landing/landing-icons";
import { Container, Label, Section } from "@/components/landing/layout-primitives";
import { landingPrimaryButton } from "@/components/landing/landing-button";

const MARK_SIZE = 20;
const HEADING_ID = "start-heading";

export function StartSection() {
  return (
    // No panel of its own: the last snap stop pairs this call to action with
    // the footer, and that panel is composed in app/page.tsx. Named because it
    // sits outside <main>, so the footer below keeps its contentinfo landmark.
    <Section aria-labelledby={HEADING_ID}>
      <Container>
        <h2 id={HEADING_ID} className="sp-h2 sp-measure text-sp-text">
          Two connections, then it runs.
        </h2>

        <ul className="mt-12 flex flex-col gap-3">
          {ONBOARDING_STEPS.map((step) => (
            <li
              key={step.number}
              className="sp-surface-1 flex flex-wrap items-center gap-4 px-6 py-4"
            >
              <Label className="shrink-0 text-sp-cobalt">{step.number}</Label>
              <span className="shrink-0">
                {step.system === "gmail" ? (
                  <GmailMark size={MARK_SIZE} />
                ) : (
                  <SignalMark size={MARK_SIZE} />
                )}
              </span>
              <span className="sp-body w-40 shrink-0 text-sp-text">{step.name}</span>
              <span className="sp-body min-w-0 flex-1 text-sp-muted">
                {step.detail}
              </span>
              <Label className="shrink-0 normal-case tracking-[0.04em]">
                {step.time}
              </Label>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-center gap-6">
          <PendingLink href="/dashboard" className={landingPrimaryButton}>
            Get started
            <ArrowRight
              size={ICON_SIZE_SM}
              strokeWidth={ICON_STROKE}
              aria-hidden="true"
            />
          </PendingLink>
          <span className="sp-body text-sp-muted">Free to start. No card needed.</span>
        </div>
      </Container>
    </Section>
  );
}
