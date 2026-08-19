"use client";

import { usePlayback } from "@/components/landing/use-playback";

/**
 * Arms the stroke draw-in for everything inside it, from the same 60%-visible
 * test the rest of the page uses: landing on the panel starts the sequence and
 * leaving rewinds it. Under reduced motion it never arms, and the CSS leaves
 * every stroke drawn.
 */
export function DrawOnView({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, isOnScreen, prefersReducedMotion } = usePlayback<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-draw={isOnScreen && !prefersReducedMotion ? "true" : "false"}
      className={className}
    >
      {children}
    </div>
  );
}
