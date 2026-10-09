import { PendingLink } from "@/components/pending-link";
import { FlowDiagram } from "@/components/landing/flow-diagram";
import {
  BlurWords,
  Container,
  Icon,
  ghostButton,
  primaryButton,
} from "@/components/landing/landing-ui";

const SECOND_LINE_DELAY_MS = 180;
const ACTIONS_DELAY_MS = 420;
const VISUAL_DELAY_MS = 560;

function delayStyle(ms: number) {
  return { "--q-delay": `${ms}ms` } as React.CSSProperties;
}

export function LandingHero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="q-hero-glow pointer-events-none absolute inset-0 -z-10" />

      <Container className="flex flex-col items-center pt-24 pb-16 text-center sm:pt-32">
        <h1 id="hero-title" className="q-hero-title max-w-[900px] text-q-fg">
          <BlurWords text="Reply “send.”" />
          <br />
          <BlurWords
            text="That’s the whole interface."
            startMs={SECOND_LINE_DELAY_MS}
            className="text-q-fg-3"
          />
        </h1>

        <div
          className="q-enter mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
          style={delayStyle(ACTIONS_DELAY_MS)}
        >
          <PendingLink href="/dashboard" className={primaryButton}>
            Get started free
            <Icon name="ArrowRight" />
          </PendingLink>
          <a href="#how-it-works" className={ghostButton}>
            See how it works
          </a>
        </div>

        <div className="q-enter mt-16 w-full sm:mt-20" style={delayStyle(VISUAL_DELAY_MS)}>
          <FlowDiagram isPriority />
        </div>
      </Container>
    </section>
  );
}
