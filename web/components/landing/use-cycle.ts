"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayback } from "@/components/landing/use-playback";

/** How long a cycle may run without completing a pass before we give up on it. */
const WATCHDOG_FACTOR = 2;
const WATCHDOG_GRACE_MS = 1500;

type CycleOptions = {
  /** Milliseconds from the start of the cycle at which each step fires. */
  cues: readonly number[];
  /** Full cycle length, including the hold at the end, in milliseconds. */
  duration: number;
  /** Step to rest on when not playing. Defaults to every cue having fired. */
  restStep?: number;
};

/**
 * Drives a looping animation from a single `elapsed` value advanced by rAF.
 * Every frame recomputes `step` from `elapsed` alone, so nothing is queued and
 * nothing can desync. Callers hide elements only while `isPlaying`, so a
 * stalled or reduced-motion animation still leaves everything visible.
 */
export function useCycle<T extends HTMLElement>({
  cues,
  duration,
  restStep = cues.length,
}: CycleOptions) {
  const elapsed = useRef(0);
  const completedPass = useRef(false);
  const [step, setStep] = useState(0);
  const [hasGivenUp, setHasGivenUp] = useState(false);
  // Mirrors "elapsed has moved" as state, since render cannot read a ref.
  const [hasStarted, setHasStarted] = useState(false);

  // Runs when the section leaves the viewport. Clears hasGivenUp too, so a
  // wrong stall guess does not outlive the visit that produced it.
  const rewind = useCallback(() => {
    elapsed.current = 0;
    completedPass.current = false;
    setStep(0);
    setHasStarted(false);
    setHasGivenUp(false);
  }, []);

  const { ref, isRunning, isOnScreen, prefersReducedMotion, pauseProps } =
    usePlayback<T>({ enabled: !hasGivenUp, onLeave: rewind });

  const isPlaying = !prefersReducedMotion && !hasGivenUp && isOnScreen && hasStarted;

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let frame = 0;
    let last = performance.now();

    function tick(now: number) {
      elapsed.current += now - last;
      last = now;

      if (elapsed.current >= duration) {
        elapsed.current = 0;
        completedPass.current = true;
      }

      let next = 0;

      for (let index = 0; index < cues.length; index += 1) {
        if (elapsed.current >= cues[index]) {
          next = index + 1;
        }
      }

      setStep(next);
      setHasStarted(true);
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [cues, duration, isRunning]);

  // Safety net: if a full pass never completes, show the finished state rather
  // than leave the section half drawn.
  //
  // Gated on isRunning, not isOnScreen: elapsed time freezes while the cycle is
  // paused (backgrounded tab, pointer resting on it), so a wall-clock watchdog
  // counted those pauses as a stall and killed the animation permanently.
  useEffect(() => {
    if (!isRunning || hasGivenUp || prefersReducedMotion) {
      return;
    }

    const watchdog = window.setTimeout(() => {
      if (!completedPass.current) {
        setHasGivenUp(true);
      }
    }, duration * WATCHDOG_FACTOR + WATCHDOG_GRACE_MS);

    return () => window.clearTimeout(watchdog);
  }, [duration, hasGivenUp, isRunning, prefersReducedMotion]);

  return {
    ref,
    step: isPlaying ? step : restStep,
    /** False whenever the finished state should show. Callers hide only when true. */
    isPlaying,
    pauseProps,
  };
}
