"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const VISIBILITY_THRESHOLD = 0.15;

/**
 * The page's one scroll reveal. Fires once at 15% visibility and never again,
 * including on scroll back up. Reduced motion is handled in CSS, so this hook
 * runs the same either way and the final state simply appears immediately.
 */
export function useRevealed<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || isRevealed) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: VISIBILITY_THRESHOLD },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isRevealed]);

  return { ref, isRevealed };
}

type RevealProps = {
  /** Milliseconds of stagger. Keep groups to six children or fewer. */
  delay?: number;
  as?: "div" | "li" | "section" | "p";
  className?: string;
  children: React.ReactNode;
};

export function Reveal({
  delay = 0,
  as = "div",
  className,
  children,
}: RevealProps) {
  const { ref, isRevealed } = useRevealed<HTMLElement>();
  // Widened here rather than threading a generic through every caller.
  const Tag = as as "div";

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      data-visible={isRevealed ? "true" : "false"}
      style={{ "--sp-delay": `${delay}ms` } as React.CSSProperties}
      className={cn("sp-reveal", className)}
    >
      {children}
    </Tag>
  );
}
