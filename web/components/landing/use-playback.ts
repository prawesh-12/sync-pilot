"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** How much must be on screen to run. Crossing it downward rewinds a loop. */
const VISIBILITY_THRESHOLD = 0.6;
/** Pointer travel that counts as "a reader is looking at this", in pixels. */
const INTENT_DISTANCE_PX = 4;

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

function subscribeTabVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);

  return () => document.removeEventListener("visibilitychange", onChange);
}

type PlaybackOptions = {
  /** Set false to stop permanently, as when a reader takes over a demo. */
  enabled?: boolean;
  /** Called when the element leaves the viewport, for loops that rewind. */
  onLeave?: () => void;
};

/**
 * The conditions under which an animation may run: on screen, tab in front,
 * reader not pointing at it, motion not reduced. Shared so every loop on the
 * page pauses for the same reasons.
 */
export function usePlayback<T extends HTMLElement>({
  enabled = true,
  onLeave,
}: PlaybackOptions = {}) {
  const ref = useRef<T>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const onLeaveRef = useRef(onLeave);
  const [isOnScreen, setIsOnScreen] = useState(false);
  const [isPointedAt, setIsPointedAt] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  const isTabVisible = useSyncExternalStore(
    subscribeTabVisibility,
    () => !document.hidden,
    () => true,
  );

  // Kept in a ref so a caller's inline callback never re-creates the observer.
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    const node = ref.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // An animation taller than the viewport can never reach 60% of its own
        // height on screen, so it counts once it fills 60% of the viewport.
        const visible = entries.some(
          (entry) =>
            entry.intersectionRatio >= VISIBILITY_THRESHOLD ||
            entry.intersectionRect.height >=
              window.innerHeight * VISIBILITY_THRESHOLD,
        );

        if (!visible) {
          onLeaveRef.current?.();
        }

        setIsOnScreen(visible);
      },
      // Several steps, so the ratio is re-reported as a panel scrolls through.
      { threshold: [0, 0.25, 0.5, VISIBILITY_THRESHOLD, 0.75, 1] },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // Browsers emit a pointermove when content scrolls under a still cursor, so
  // the pause waits for coordinates that actually moved.
  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const previous = lastPoint.current;
    const moved =
      previous !== null &&
      Math.hypot(previous.x - event.clientX, previous.y - event.clientY) >
        INTENT_DISTANCE_PX;

    lastPoint.current = { x: event.clientX, y: event.clientY };

    if (moved) {
      setIsPointedAt(true);
    }
  }, []);

  const onPointerLeave = useCallback(() => {
    lastPoint.current = null;
    setIsPointedAt(false);
  }, []);

  return {
    ref,
    isRunning:
      enabled && !prefersReducedMotion && isOnScreen && isTabVisible && !isPointedAt,
    isOnScreen,
    prefersReducedMotion,
    /** Spread onto the element that should freeze playback while pointed at. */
    pauseProps: { onPointerMove, onPointerLeave },
  };
}
