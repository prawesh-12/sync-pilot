import Image from "next/image";
import { OVERHEAD_POINTS, type OverheadPoint } from "@/components/landing/landing-content";
import { Container, SectionIntro } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const HEADING_ID = "how-it-works-title";
const CARD_IMAGE_WIDTH = 1200;
const CARD_IMAGE_HEIGHT = 900;

function PointCard({ point, isFlipped }: { point: OverheadPoint; isFlipped: boolean }) {
  return (
    <article className="q-surface grid overflow-hidden rounded-2xl md:grid-cols-2">
      <Image
        src={point.image}
        alt=""
        width={CARD_IMAGE_WIDTH}
        height={CARD_IMAGE_HEIGHT}
        sizes="(min-width: 768px) 536px, 100vw"
        className={cn(
          "aspect-[4/3] h-full w-full object-cover",
          isFlipped ? "md:order-first" : "md:order-last",
        )}
      />
      <div className="flex flex-col justify-center border-t border-q-line px-6 py-8 sm:px-10 md:border-t-0 md:py-12">
        <p className="q-eyebrow q-tnum text-q-brand-text">{point.label}</p>
        <h3 className="q-feature-title mt-3 text-q-fg">
          {point.title}
        </h3>
        <p className="q-lead mt-4 max-w-[420px] text-q-fg-3">{point.detail}</p>
      </div>
    </article>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby={HEADING_ID} className="q-section">
      <Container>
        <Reveal className="mx-auto flex flex-col items-center text-center">
          <SectionIntro
            id={HEADING_ID}
            eyebrow="How it works"
            title="An inbox is not a list of messages."
            quietTitle="It is a list of decisions."
            lead="SyncPilot reads each new email, decides what it needs, and writes the reply. You only answer one message on Signal."
          />
        </Reveal>

        <ol className="mt-16 flex flex-col gap-6">
          {OVERHEAD_POINTS.map((point, index) => (
            <li key={point.key}>
              <Reveal>
                <PointCard point={point} isFlipped={index % 2 === 1} />
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
