"use client";

import { Accordion } from "radix-ui";
import { Plus } from "lucide-react";
import type { Faq } from "@/components/landing/landing-content";

const ICON_SIZE = 17;

export function LandingFaq({ items }: { items: Faq[] }) {
  return (
    <Accordion.Root type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <Accordion.Item
          key={item.question}
          value={`item-${index}`}
          className="border-b border-white/7 last:border-b-0"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left outline-none transition-colors hover:text-sp-text focus-visible:ring-2 focus-visible:ring-sp-amber focus-visible:ring-offset-4 focus-visible:ring-offset-sp-base data-[state=open]:text-sp-text">
              <span className="text-base font-medium text-sp-text/85 transition-colors group-hover:text-sp-text">
                {item.question}
              </span>
              <Plus
                size={ICON_SIZE}
                strokeWidth={1.8}
                aria-hidden="true"
                className="shrink-0 text-sp-muted transition-all duration-200 group-hover:text-sp-text group-data-[state=open]:rotate-45"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="sp-accordion-content">
            <p className="max-w-xl pb-6 text-sm leading-relaxed text-sp-muted">
              {item.answer}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
