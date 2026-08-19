"use client";

import { useEffect } from "react";
import { GmailMark, SignalMark, SyncPilotMark } from "@/components/landing/brand-marks";
import { TOTAL_ACTIONS } from "@/components/landing/landing-content";
import { NodeRail, type PacketState, type RailNode } from "@/components/landing/node-rail";
import { useCycle } from "@/components/landing/use-cycle";

const MARK_SIZE = 28;

/*
 * The short version of the pipeline, for the hero: 2.6s of motion then a 2.5s
 * hold. The packet is a plain dot here — this strip's segments are about 58px,
 * too narrow for a labelled chip to sit clear of both nodes.
 */
const CUES = [0, 400, 1000, 1150, 1500, 2100, 2600] as const;
const CYCLE_MS = 5100;

const NODE_STEPS = [1, 3, 6];
const SEGMENT_STEPS = [2, 5];
const EMIT_STEPS = [1, 4, 7];
const ABSORB_STEPS = [0, 3, 6];

type HeroPipelineProps = {
  /** Fires when the draft should drop into the chat panel below. */
  onDraftReady: () => void;
};

function packetStateAt(step: number): PacketState {
  for (let node = EMIT_STEPS.length - 1; node >= 0; node -= 1) {
    if (step >= EMIT_STEPS[node]) {
      // The journey ends at Signal, so the packet is not re-emitted there.
      return node === EMIT_STEPS.length - 1
        ? { kind: "hidden" }
        : { kind: "emit", node };
    }

    if (step >= ABSORB_STEPS[node]) {
      return { kind: "absorb", node };
    }

    if (node > 0 && step >= SEGMENT_STEPS[node - 1]) {
      return { kind: "travel", leg: node - 1 };
    }
  }

  return { kind: "hidden" };
}

export function HeroPipeline({ onDraftReady }: HeroPipelineProps) {
  const { ref, step, isPlaying, pauseProps } = useCycle<HTMLDivElement>({
    cues: CUES,
    duration: CYCLE_MS,
  });

  const hasDelivered = step >= 7;

  useEffect(() => {
    if (hasDelivered) {
      onDraftReady();
    }
  }, [hasDelivered, onDraftReady]);

  const nodes: RailNode[] = [
    { key: "gmail", label: "Gmail", mark: <GmailMark size={MARK_SIZE} /> },
    { key: "syncpilot", label: "SyncPilot", mark: <SyncPilotMark size={MARK_SIZE} /> },
    { key: "signal", label: "Signal", mark: <SignalMark size={MARK_SIZE} />, done: true },
  ];

  return (
    <div
      ref={ref}
      {...pauseProps}
      data-playing={isPlaying ? "true" : "false"}
      className="sp-stage"
    >
      <div className="sp-surface-1 px-6 py-6">
        <NodeRail
          nodes={nodes}
          nodeOn={NODE_STEPS.map((at) => step >= at)}
          segmentFilled={SEGMENT_STEPS.map((at) => step >= at)}
          packet={packetStateAt(step)}
        />

        {/* Reserved line, so the label appearing never moves the panel. */}
        <div className="mt-4 flex h-5 items-center justify-center">
          <span
            data-step="3"
            data-on={step >= 3 && step < 6 ? "true" : "false"}
            className="sp-label text-sp-cobalt"
          >
            1 of {TOTAL_ACTIONS} actions
          </span>
        </div>
      </div>
    </div>
  );
}
