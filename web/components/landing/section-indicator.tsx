"use client";

import { useEffect, useState } from "react";

/** Enough thresholds to tell a mostly-visible panel from a barely-visible one. */
const THRESHOLDS = [0, 0.25, 0.5, 0.6, 0.75, 1];

type PanelEntry = { id: string; label: string };

/**
 * One dot per panel, fixed to the right edge, marking where you are on a page
 * that moves a full screen at a time. Dots are buttons, so this doubles as a
 * jump nav on the widths where snapping is off.
 */
export function SectionIndicator() {
  const [panels, setPanels] = useState<PanelEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-snap-panel]"),
    );

    if (nodes.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    // Panels with a section id keep it, so a dot click leaves the same hash the
    // nav would. The rest get one that is stable across renders.
    nodes.forEach((node, index) => {
      if (!node.id) {
        node.id = `panel-${index}`;
      }
    });

    const visible = new Map<Element, number>();
    let hasListed = false;

    const observer = new IntersectionObserver(
      (entries) => {
        // The observer fires once per panel on observe, so the list is
        // published here rather than from the effect body, which would cost a
        // second render pass.
        if (!hasListed) {
          hasListed = true;
          setPanels(
            nodes.map((node) => ({
              id: node.id,
              label: node.dataset.panelLabel ?? node.id,
            })),
          );
        }

        entries.forEach((entry) =>
          visible.set(entry.target, entry.intersectionRect.height),
        );

        // Whichever panel shows the most of itself.
        let bestIndex = 0;
        let bestHeight = -1;

        nodes.forEach((node, index) => {
          const height = visible.get(node) ?? 0;

          if (height > bestHeight) {
            bestHeight = height;
            bestIndex = index;
          }
        });

        setActiveIndex(bestIndex);
      },
      { threshold: THRESHOLDS },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  if (panels.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Page position"
      className="fixed right-6 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-center gap-1 md:flex"
    >
      {panels.map((panel, index) => (
        <button
          key={panel.id}
          type="button"
          // A 6px dot is not a target, so the button is padded out to 24px.
          className="sp-dot-button sp-focus flex size-6 cursor-pointer items-center justify-center rounded-full"
          aria-current={index === activeIndex ? "true" : undefined}
          aria-label={panel.label}
          title={panel.label}
          onClick={() => {
            document
              .getElementById(panel.id)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span aria-hidden="true" className="sp-dot" />
        </button>
      ))}
    </nav>
  );
}
