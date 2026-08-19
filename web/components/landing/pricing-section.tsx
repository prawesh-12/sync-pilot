import { Check } from "lucide-react";
import { PendingLink } from "@/components/pending-link";
import { PLANS, PRICING_NOTE, type Plan } from "@/components/landing/landing-content";
import { ICON_SIZE_SM, ICON_STROKE } from "@/components/landing/landing-icons";
import {
  Container,
  Label,
  Panel,
  Section,
} from "@/components/landing/layout-primitives";
import { Reveal } from "@/components/landing/reveal";
import {
  landingPrimaryButton,
  landingSecondaryButton,
} from "@/components/landing/landing-button";
import { cn } from "@/lib/utils";

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col p-8",
        plan.featured ? "sp-lit" : "sp-surface-1",
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <Label className={plan.featured ? "text-sp-cobalt" : undefined}>
          {plan.name}
        </Label>
        {plan.badge ? <Label className="text-sp-amber">{plan.badge}</Label> : null}
      </div>

      <p className="mt-6 flex items-baseline gap-2">
        <span className="sp-h2 text-sp-text">{plan.price}</span>
        {plan.cadence ? (
          <span className="sp-body text-sp-muted">{plan.cadence}</span>
        ) : null}
      </p>

      <p className="sp-body sp-measure mt-4 text-sp-muted">{plan.summary}</p>

      {/* flex-1 pushes the button to the bottom, so both cards align. */}
      <ul className="mt-8 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              size={ICON_SIZE_SM}
              strokeWidth={ICON_STROKE}
              aria-hidden="true"
              className="mt-1 shrink-0 text-sp-muted"
            />
            <span className="sp-body text-sp-muted">{feature}</span>
          </li>
        ))}
      </ul>

      <PendingLink
        href="/dashboard"
        className={cn(
          "mt-8 w-full",
          plan.featured ? landingPrimaryButton : landingSecondaryButton,
        )}
      >
        Get started
      </PendingLink>
    </div>
  );
}

export function PricingSection() {
  return (
    <Section id="pricing">
      <Panel label="Pricing">
        <Container>
          <h2 className="sp-h2 sp-measure text-sp-text">Pricing</h2>

          {/* Pro sits first on mobile, where it is the card worth seeing. */}
          <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2">
            {PLANS.map((plan, index) => (
              <Reveal
                key={plan.name}
                delay={index * 70}
                className={plan.featured ? "order-first md:order-none" : undefined}
              >
                <PlanCard plan={plan} />
              </Reveal>
            ))}
          </div>

          <p className="sp-body mt-8 text-sp-muted">{PRICING_NOTE}</p>
        </Container>
      </Panel>
    </Section>
  );
}
