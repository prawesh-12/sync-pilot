import { Check } from "lucide-react";
import {
  ALTERNATE_DECISIONS,
  DECISION_REASON,
  SAMPLE_EMAIL,
  SELECTED_DECISION,
} from "@/components/landing/landing-content";
import { Meta } from "@/components/landing/product-surface";

const CHECK_SIZE = 15;

function IncomingEmail() {
  return (
    <div className="text-center">
      <Meta className="uppercase tracking-[0.14em]">Incoming</Meta>
      <p className="mt-2.5 text-lg font-medium text-sp-text">
        {SAMPLE_EMAIL.subject}
      </p>
      <p className="mt-1 text-sm text-sp-muted">
        {SAMPLE_EMAIL.sender} &middot; &ldquo;{SAMPLE_EMAIL.preview}&rdquo;
      </p>
    </div>
  );
}

function SelectedAction() {
  return (
    <div className="text-center">
      <span className="inline-flex items-center gap-2.5 rounded-full bg-sp-cobalt/12 px-5 py-2.5 ring-1 ring-sp-cobalt/35">
        <Check
          size={CHECK_SIZE}
          strokeWidth={2.6}
          aria-hidden="true"
          className="text-sp-cobalt"
        />
        <span className="font-display text-xl font-semibold tracking-tight text-sp-text">
          {SELECTED_DECISION.name}
        </span>
      </span>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-sp-muted">
        {DECISION_REASON}
      </p>
    </div>
  );
}

function Alternatives() {
  return (
    <div className="mt-14 text-center">
      <Meta className="uppercase tracking-[0.14em]">Passed over</Meta>
      <ul className="mx-auto mt-4 flex max-w-lg flex-wrap justify-center gap-x-7 gap-y-2.5">
        {ALTERNATE_DECISIONS.map((decision) => (
          <li key={decision.name} className="text-sm text-sp-muted">
            {decision.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DecisionSection() {
  return (
    <section id="decision" className="scroll-mt-16 px-5 py-16 sm:px-6 md:py-24">
      <div className="mx-auto w-full max-w-2xl">
        <IncomingEmail />
        <div
          aria-hidden="true"
          className="mx-auto my-7 h-10 w-px bg-gradient-to-b from-white/5 to-sp-cobalt/45"
        />
        <SelectedAction />
        <Alternatives />
      </div>
    </section>
  );
}
