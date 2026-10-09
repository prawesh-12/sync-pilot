import { FAQS } from "@/components/landing/landing-content";
import { Container, Icon } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/landing/reveal";

const HEADING_ID = "faq-title";
const TOGGLE_ICON_SIZE = 18;

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby={HEADING_ID} className="q-section">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <Reveal>
          <p className="q-eyebrow text-q-brand-text">FAQ</p>
          <h2 id={HEADING_ID} className="q-section-title mt-4 text-q-fg">
            Before you connect anything
          </h2>
        </Reveal>

        <Reveal>
          <div className="border-t border-q-line-2">
            {FAQS.map((item) => (
              <details key={item.question} className="q-faq group border-b border-q-line-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-md py-5 text-left">
                  <span className="text-base q-medium text-q-fg-2 transition-colors duration-100 group-hover:text-q-fg group-open:text-q-fg">
                    {item.question}
                  </span>
                  <Icon name="Add" size={TOGGLE_ICON_SIZE} className="text-q-fg-4" />
                </summary>
                <p className="q-body max-w-[640px] pb-6 text-q-fg-3">{item.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
