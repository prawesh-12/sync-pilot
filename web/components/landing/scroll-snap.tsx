"use client";

import { useEffect } from "react";

const SNAP_CLASS = "sp-snap";
/** A panel this much taller than the viewport is treated as overflowing. */
const OVERFLOW_TOLERANCE_PX = 2;

/**
 * Turns panel snapping on for the landing page only, and keeps checking that
 * every panel still fits the viewport it is snapping in.
 *
 * A panel taller than the viewport must not become a hard stop, or mandatory
 * snapping parks the reader at its top with the rest unreachable. Those are
 * marked `data-fits="false"`, and one overflowing panel drops the whole page
 * from mandatory to proximity.
 *
 * Native CSS scroll snap throughout: the wheel is never intercepted, so
 * keyboard scrolling, find and the back button all behave normally.
 */
export function ScrollSnap() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(SNAP_CLASS);

    const panels = Array.from(
      document.querySelectorAll<HTMLElement>("[data-snap-panel]"),
    );

    function measure() {
      const limit = window.innerHeight + OVERFLOW_TOLERANCE_PX;
      let allFit = true;

      panels.forEach((panel) => {
        const fits = panel.offsetHeight <= limit;
        panel.dataset.fits = fits ? "true" : "false";
        allFit = allFit && fits;
      });

      root.dataset.snapFit = allFit ? "all" : "partial";
    }

    measure();

    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);

    panels.forEach((panel) => observer?.observe(panel));
    window.addEventListener("resize", measure);

    return () => {
      root.classList.remove(SNAP_CLASS);
      delete root.dataset.snapFit;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      panels.forEach((panel) => delete panel.dataset.fits);
    };
  }, []);

  return null;
}
