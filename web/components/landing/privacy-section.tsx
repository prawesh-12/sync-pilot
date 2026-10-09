import Image from "next/image";
import { PRIVACY_POINTS } from "@/components/landing/landing-content";
import { Container, Icon, SectionIntro } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/landing/reveal";

const HEADING_ID = "privacy-title";
const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 900;
const TEXT_DELAY_MS = 80;

export function PrivacySection() {
  return (
    <section aria-labelledby={HEADING_ID} className="q-section">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <div className="q-surface overflow-hidden rounded-2xl">
            <Image
              src="/landing/feature-private.webp"
              alt=""
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              sizes="(min-width: 1024px) 520px, 100vw"
              className="aspect-[4/3] h-auto w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={TEXT_DELAY_MS}>
          <SectionIntro
            id={HEADING_ID}
            eyebrow="Control"
            title="Your inbox stays yours."
            quietTitle="Sending is always your call."
            lead="SyncPilot can read, sort and draft. Sending is the one thing it never does on its own."
          />
          <ul className="mt-10 flex flex-col gap-4">
            {PRIVACY_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-q-fg-2">
                <Icon name="Check" className="mt-1 text-q-brand-text" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
