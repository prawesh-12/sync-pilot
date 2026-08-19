"use client";

import { Accordion } from "radix-ui";
import { Plus } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

export function LandingFaq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      className="divide-y divide-sp-text/8 border-y border-sp-text/8"
    >
      {items.map((item, index) => (
        <Accordion.Item key={item.question} value={`item-${index}`}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-sp-amber focus-visible:ring-offset-4 focus-visible:ring-offset-sp-base">
              <span className="text-[15px] font-medium text-sp-text sm:text-base">
                {item.question}
              </span>
              <Plus
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className="shrink-0 text-sp-muted transition-transform duration-200 group-data-[state=open]:rotate-45 group-hover:text-sp-text"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="sp-accordion-content">
            <p className="max-w-2xl pr-8 pb-5 text-[14.5px] leading-relaxed text-sp-muted">
              {item.answer}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
