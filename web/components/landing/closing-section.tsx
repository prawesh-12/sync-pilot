import Image from "next/image";
import Link from "next/link";
import { PendingLink } from "@/components/pending-link";
import {
  Container,
  Icon,
  ghostButton,
  primaryButton,
} from "@/components/landing/landing-ui";
import { Reveal } from "@/components/landing/reveal";

const HEADING_ID = "closing-title";

// Height tracks the image's 12:5 shape; horizon sits 71% down.
export function ClosingSection() {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative isolate h-[41.667vw] min-h-[560px] overflow-hidden"
    >
      <Image
        src="/landing/closing.webp"
        alt=""
        fill
        sizes="100vw"
        className="q-fade-top -z-10 object-cover object-bottom"
      />

      <Container className="absolute inset-x-0 top-0 bottom-[34%] flex items-center justify-center text-center">
        <Reveal className="flex max-w-[640px] flex-col items-center">
          <h2 id={HEADING_ID} className="q-section-title text-q-fg">
            Two connections,
            <span className="text-q-fg-3"> then it runs.</span>
          </h2>
          <p className="q-lead mt-5 text-q-fg-2">
            Sign in with Google, then scan one QR code with Signal. About a minute in all.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <PendingLink href="/dashboard" className={primaryButton}>
              Get started free
              <Icon name="ArrowRight" />
            </PendingLink>
            <Link href="/how-to-use" className={ghostButton}>
              Read the guide
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
