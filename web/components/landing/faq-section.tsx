"use client";

import { Accordion } from "radix-ui";
import { Plus } from "lucide-react";
import { FAQS, type Faq } from "@/components/landing/landing-content";
import { ICON_STROKE } from "@/components/landing/landing-icons";
import { Container, Panel, Section } from "@/components/landing/layout-primitives";

const ICON_SIZE = 18;
const FIRST_ITEM = "item-0";

/**
 * All nine questions ride in one panel. Measured at 676px with the first
 * answer open against a 772px budget at a 900px viewport, and the accordion
 * only ever opens one answer at a time, so the longest of them still fits.
 * Should a narrower window push it over anyway, ScrollSnap drops this panel's
 * hard stop rather than trapping the reader at its top.
 */
function FaqList({ items }: { items: Faq[] }) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      defaultValue={FIRST_ITEM}
      className="flex w-full flex-col gap-2"
    >
      {items.map((item, index) => (
        <Accordion.Item
          key={item.question}
          value={`item-${index}`}
          className="sp-surface-1 overflow-hidden transition-colors duration-150 hover:bg-white/6"
        >
          <Accordion.Header>
            <Accordion.Trigger className="sp-focus group flex w-full cursor-pointer items-center justify-between gap-6 px-6 py-4 text-left">
              <span className="sp-body font-medium text-sp-text/85 transition-colors duration-150 group-hover:text-sp-text group-data-[state=open]:text-sp-text">
                {item.question}
              </span>
              <Plus
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                aria-hidden="true"
                className="shrink-0 text-sp-muted transition-transform duration-[240ms] ease-out group-data-[state=open]:rotate-45"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="sp-accordion-content">
            <p className="sp-body sp-measure px-6 pb-4 text-sp-muted">
              {item.answer}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export function FaqSection() {
  return (
    <Section id="faq">
      <Panel label="FAQ">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h2 className="sp-h2 text-sp-text">Before you connect anything</h2>
            </div>

            <div className="lg:col-span-8">
              <FaqList items={FAQS} />
            </div>
          </div>
        </Container>
      </Panel>
    </Section>
  );
}
