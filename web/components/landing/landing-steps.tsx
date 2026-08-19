import { STEPS } from "@/components/landing/landing-content";

const STEP_NUMBER_DIGITS = 2;

function formatStepNumber(index: number) {
  return String(index + 1).padStart(STEP_NUMBER_DIGITS, "0");
}

export function LandingSteps() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 sm:px-6 md:py-24"
    >
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        How it works
      </h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-sp-muted">
        Five steps, start to finish. You only appear in step four.
      </p>

      <ol className="mt-10 divide-y divide-sp-text/8 border-t border-sp-text/8">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="grid gap-2 py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-6"
          >
            <span
              aria-hidden="true"
              className="font-mono-tech text-sm text-sp-muted/70 sm:pt-0.5"
            >
              {formatStepNumber(index)}
            </span>
            <div>
              <h3 className="text-[17px] font-medium text-sp-text">
                {step.title}
              </h3>
              <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-sp-muted">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
