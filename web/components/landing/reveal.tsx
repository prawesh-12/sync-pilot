"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const VISIBILITY_THRESHOLD = 0.15;

function useRevealed<T extends HTMLElement>() {
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
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ delay = 0, className, children }: RevealProps) {
  const { ref, isRevealed } = useRevealed<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-visible={isRevealed ? "true" : "false"}
      style={{ "--q-delay": `${delay}ms` } as React.CSSProperties}
      className={cn("q-reveal", className)}
    >
      {children}
    </div>
  );
}
