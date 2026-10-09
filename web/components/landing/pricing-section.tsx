import { PendingLink } from "@/components/pending-link";
import { PLANS, PRICING_NOTE, type Plan } from "@/components/landing/landing-content";
import {
  Container,
  Icon,
  SectionIntro,
  ghostButton,
  primaryButton,
} from "@/components/landing/landing-ui";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const HEADING_ID = "pricing-title";
const CARD_STAGGER_MS = 80;

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-[var(--q-highlight)] sm:p-8",
        plan.featured ? "border-q-brand/40 bg-q-panel" : "border-q-line-2 bg-q-chrome",
      )}
    >
      {plan.featured ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(118,89,243,0.14),transparent_70%)]"
        />
      ) : null}

      <div className="relative flex items-center justify-between gap-4">
        <h3 className="q-medium text-[15px] text-q-fg">{plan.name}</h3>
        {plan.badge ? (
          <span className="rounded-full border border-q-brand/30 bg-q-brand-subtle px-2.5 py-0.5 text-xs text-q-brand-text">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <p className="relative mt-5 flex items-baseline gap-1.5">
        <span className="q-tnum q-semibold text-4xl tracking-tight text-q-fg">{plan.price}</span>
        {plan.cadence ? <span className="text-sm text-q-fg-3">{plan.cadence}</span> : null}
      </p>
      <p className="relative mt-2 text-sm leading-relaxed text-q-fg-3">{plan.summary}</p>

      <ul className="relative mt-6 flex flex-1 flex-col gap-2.5 border-t border-q-line pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-q-fg-2">
            <Icon name="Check" className="mt-0.5 text-q-fg-4" />
            {feature}
          </li>
        ))}
      </ul>

      <PendingLink
        href="/dashboard"
        className={cn("relative mt-8 w-full", plan.featured ? primaryButton : ghostButton)}
      >
        Get started
      </PendingLink>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby={HEADING_ID} className="q-section">
      <Container>
        <Reveal>
          <SectionIntro
            id={HEADING_ID}
            eyebrow="Pricing"
            title="Free for a normal inbox."
            quietTitle="Pro when it gets busy."
            lead={PRICING_NOTE}
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} delay={index * CARD_STAGGER_MS} className="h-full">
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
