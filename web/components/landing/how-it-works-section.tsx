"use client";

import { User } from "lucide-react";
import { GmailMark, SignalMark, SyncPilotMark } from "@/components/landing/brand-marks";
import {
  CHOSEN_ACTION,
  DECISION_REASON,
  JOURNEY,
  JOURNEY_SUMMARY,
  REJECTED_ACTIONS,
  SAMPLE_DRAFT,
  SAMPLE_EMAIL,
  TOTAL_ACTIONS,
  type JourneyStation,
} from "@/components/landing/landing-content";
import { actionIcon, Glyph, ICON_STROKE } from "@/components/landing/landing-icons";
import {
  Container,
  Label,
  Panel,
  RefCode,
  Section,
} from "@/components/landing/layout-primitives";
import {
  NodeRail,
  type PacketState,
  type RailNode,
} from "@/components/landing/node-rail";
import { useCycle } from "@/components/landing/use-cycle";

const MARK_SIZE = 24;

/*
 * 4s of motion then a 2s hold, so the finished frame is what shows most of the
 * time. Every card is on screen from the first frame — the cues only move them
 * from dim to lit, so arriving mid-cycle still shows the whole journey.
 */
const CUES = [
  150, 500, 850, 950, 1050, 1400, 1750, 2150, 2500, 2600, 2900, 3250, 3350,
  3600, 3950, 4050, 6100,
] as const;
const CYCLE_MS = 6500;
const FADE_OUT_STEP = 17;

// Which step lights each node, and which lifts in each card.
const NODE_STEPS = [1, 3, 9, 12, 15];
// Which step starts each segment filling.
const SEGMENT_STEPS = [2, 8, 11, 14];
// Which step re-emits the packet on the far side of each node.
const EMIT_STEPS = [1, 4, 10, 13, 16];
// Which step absorbs it into each node. Node 1 is never arrived at.
const ABSORB_STEPS = [0, 3, 9, 12, 15];

// Shortened for the chip: a segment is only ~168px wide, so a longer label
// would leave the packet no room to travel.
const PACKET_LABELS = ["Q3 deck", "Draft reply", "A3X9", "A3X9 send", "Sent"];

function stationMark(system: JourneyStation["system"]) {
  switch (system) {
    case "gmail":
      return <GmailMark size={MARK_SIZE} />;
    case "signal":
      return <SignalMark size={MARK_SIZE} />;
    case "syncpilot":
      return <SyncPilotMark size={MARK_SIZE} />;
    default:
      return (
        <User
          size={MARK_SIZE}
          strokeWidth={ICON_STROKE}
          aria-label="You"
          className="text-sp-text"
        />
      );
  }
}

export function HowItWorksSection() {
  const { ref, step, isPlaying, pauseProps } = useCycle<HTMLDivElement>({
    cues: CUES,
    duration: CYCLE_MS,
    // Step 17 fades out before the restart, so rest on 16: the completed frame.
    restStep: 16,
  });

  const isSpent = step >= FADE_OUT_STEP;
  const nodeOn = NODE_STEPS.map((at) => step >= at && !isSpent);
  const segmentFilled = SEGMENT_STEPS.map((at) => step >= at && !isSpent);
  const packet = packetStateAt(step);
  const chosenLit = step >= 7 && !isSpent;

  const railNodes: RailNode[] = JOURNEY.map((station, index) => ({
    key: `${station.label}-${index}`,
    label: station.label,
    mark: stationMark(station.system),
    done: index === JOURNEY.length - 1,
  }));

  return (
    // The animation spans both panels, so the stage wrapper sits above them
    // while both stay inside one <section>.
    <Section id="how-it-works" {...pauseProps}>
      <div
        ref={ref}
        data-playing={isPlaying ? "true" : "false"}
        className="sp-stage"
      >
        <Panel label="How it works">
          <Container>
            <h2 className="sp-h2 sp-measure text-sp-text">
              One message, five systems, one word from you.
            </h2>
            <p className="sp-body sp-measure mt-6 text-sp-muted">
              {JOURNEY_SUMMARY}
            </p>

            {/* The chip only appears where a segment is wide enough for it. */}
            <div className="mt-16 mb-8 hidden md:block">
              <NodeRail
                nodes={railNodes}
                nodeOn={nodeOn}
                segmentFilled={segmentFilled}
                packet={packet}
                packetLabel={packetLabelAt(step)}
              />
            </div>
            <div className="mt-16 mb-8 md:hidden">
              <NodeRail
                nodes={railNodes}
                nodeOn={nodeOn}
                segmentFilled={segmentFilled}
                packet={packet}
              />
            </div>

            <ol className="grid items-stretch gap-6 md:grid-cols-5">
              {JOURNEY.map((station, index) => {
                const on = step >= NODE_STEPS[index];
                const isFinal = index === JOURNEY.length - 1;

                return (
                  <li
                    key={station.label + station.title}
                    data-step={NODE_STEPS[index]}
                    data-card="true"
                    data-on={on ? "true" : "false"}
                    className="sp-surface-1 sp-hover-lift p-6 md:p-7"
                  >
                    <Label>{station.label}</Label>
                    <p
                      className={`sp-h3 mt-3 ${isFinal ? "text-sp-sage" : "text-sp-text"}`}
                    >
                      {station.title}
                    </p>
                    <Label className="mt-3 block normal-case tracking-[0.04em]">
                      {station.meta}
                    </Label>
                  </li>
                );
              })}
            </ol>
          </Container>
        </Panel>

        {/* Its own snap stop: the rail, the cards and this panel run ~900px at
            a 900px viewport, and one stop would leave half of that unreachable. */}
        <Panel label="The decision">
          <Container>
            <Label>The decision</Label>
            <h2 className="sp-h2 sp-measure mt-3 text-sp-text">
              Seven ways to handle it. It commits to one.
            </h2>

            <div className="mt-10 grid items-start gap-6 lg:grid-cols-12">
              <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
                <div className="sp-surface-1 p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <Label>Incoming</Label>
                    <Label className="shrink-0 normal-case tracking-[0.04em]">
                      {SAMPLE_EMAIL.receivedAt}
                    </Label>
                  </div>
                  <p className="sp-h3 mt-3 text-sp-text">{SAMPLE_EMAIL.subject}</p>
                  <p className="sp-body sp-measure mt-2 text-sp-muted">
                    {SAMPLE_EMAIL.sender} asked: &ldquo;{SAMPLE_EMAIL.preview}&rdquo;
                  </p>
                </div>

                <div
                  data-step="7"
                  data-card="true"
                  data-on={chosenLit ? "true" : "false"}
                  className="sp-surface-1 p-6"
                >
                  <Label>What it wrote</Label>
                  <p className="sp-body mt-3 text-sp-text">{SAMPLE_DRAFT.body}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/7 pt-4">
                    <RefCode>{SAMPLE_DRAFT.refCode}</RefCode>
                    <span className="sp-label normal-case tracking-[0.04em] text-sp-muted">
                      Reply &ldquo;send&rdquo; to approve
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-6 lg:col-span-5">
                <div className="sp-surface-2 relative">
                  <span
                    aria-hidden="true"
                    data-on={chosenLit ? "true" : "false"}
                    className="sp-glow pointer-events-none absolute -inset-px rounded-[14px] border border-sp-cobalt/35 shadow-[0_0_32px_rgba(108,77,230,0.2)]"
                  />
                  <div className="relative p-6">
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                          chosenLit
                            ? "bg-sp-cobalt/20 text-sp-cobalt"
                            : "bg-white/6 text-sp-muted"
                        }`}
                      >
                        <Glyph icon={actionIcon(CHOSEN_ACTION.key)} />
                      </span>
                      <div className="min-w-0">
                        <Label className="text-sp-cobalt">Chosen</Label>
                        <p className="sp-h3 mt-1 text-sp-text">
                          {CHOSEN_ACTION.name}
                        </p>
                      </div>
                    </div>

                    {/* Dim rather than hidden, so the box is never empty. */}
                    <p
                      data-step="6"
                      data-card="true"
                      data-on={chosenLit ? "true" : "false"}
                      className="sp-body mt-4 text-sp-muted"
                    >
                      {DECISION_REASON}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <Label>Passed over</Label>
                    <Label className="text-sp-cobalt">
                      1 of {TOTAL_ACTIONS} actions
                    </Label>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {REJECTED_ACTIONS.map((action, index) => (
                      <li key={action.key}>
                        <button
                          type="button"
                          title={action.detail}
                          aria-label={`${action.name}. ${action.detail}`}
                          data-step="4"
                          data-on={step >= 4 ? "true" : "false"}
                          data-role="rejected"
                          data-dim={step >= 5 ? "true" : "false"}
                          style={{ transitionDelay: `${index * 60}ms` }}
                          className="sp-surface-1 sp-body sp-focus sp-hover-lift flex cursor-help items-center gap-2 px-3 py-2 text-sp-muted"
                        >
                          <Glyph icon={actionIcon(action.key)} />
                          {action.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </Panel>
      </div>
    </Section>
  );
}


/** The packet is emitted past a node, crosses one segment, and is absorbed. */
function packetStateAt(step: number): PacketState {
  if (step >= FADE_OUT_STEP) {
    return { kind: "hidden" };
  }

  for (let node = EMIT_STEPS.length - 1; node >= 0; node -= 1) {
    if (step >= EMIT_STEPS[node]) {
      return { kind: "emit", node };
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

/** The label changes at the node, while the packet is invisible. */
function packetLabelAt(step: number) {
  const state = packetStateAt(step);

  switch (state.kind) {
    case "emit":
    case "absorb":
      return PACKET_LABELS[state.node];
    case "travel":
      return PACKET_LABELS[state.leg];
    default:
      return PACKET_LABELS[0];
  }
}
