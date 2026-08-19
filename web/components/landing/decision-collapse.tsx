import {
  MANUAL_STEPS,
  REF_CODE,
  SYNCPILOT_STEP,
} from "@/components/landing/landing-content";
import { DrawOnView } from "@/components/landing/draw-on-view";
import {
  EnvelopeIcon,
  EyeIcon,
  NibIcon,
  PlaneIcon,
  ScalesIcon,
} from "@/components/landing/flow-icons";
import { Label, RefCode } from "@/components/landing/layout-primitives";

/**
 * The section's one figure: five decisions per email collapsing into one.
 *
 * Rows are a fixed height so the connectors can be drawn against known centre
 * lines rather than measured at runtime, and the labels stay in HTML because
 * text inside SVG cannot wrap or be selected.
 */

const ROW_HEIGHT = 48;
const ROW_GAP = 8;
const CURVE_WIDTH = 96;

/* The steps run first, each connector follows its own step, the pulse sweeps
   once they are all down, and the outcome lands last. */
const STEP_STAGGER_MS = 140;
const CONNECTOR_LEAD_MS = 260;
const PULSE_START_MS = MANUAL_STEPS.length * STEP_STAGGER_MS + 420;
const OUTCOME_MS = PULSE_START_MS + 620;

const STEP_ICONS = [EnvelopeIcon, EyeIcon, ScalesIcon, NibIcon, PlaneIcon];

/* A hue per step, reused wherever that icon appears again, so the flow and the
   cards below it read as one set. Warm to cool to green. */
const STEP_TONES = [
  "text-sp-amber", // 01 the unread pile, warm
  "text-sp-sky", //   02 reading it
  "text-sp-sage", //  03 weighing it
  "text-sp-lilac", // 04 writing it
  "text-sp-cobalt", // 05 sending it
];

const rowCentre = (index: number) =>
  index * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;

const FIGURE_HEIGHT =
  MANUAL_STEPS.length * ROW_HEIGHT + (MANUAL_STEPS.length - 1) * ROW_GAP;

// The connectors converge on the middle row's centre line.
const TARGET_Y = rowCentre((MANUAL_STEPS.length - 1) / 2);

const curvePath = (y: number) =>
  `M 0 ${y} C ${CURVE_WIDTH * 0.55} ${y}, ${CURVE_WIDTH * 0.45} ${TARGET_Y}, ${CURVE_WIDTH} ${TARGET_Y}`;

function ManualSteps() {
  return (
    <ol className="flex flex-col" style={{ gap: `${ROW_GAP}px` }}>
      {MANUAL_STEPS.map((step, index) => {
        const StepIcon = STEP_ICONS[index];
        const delay = index * STEP_STAGGER_MS;

        return (
          <li
            key={step}
            style={
              {
                height: `${ROW_HEIGHT}px`,
                "--sp-draw-delay": `${delay}ms`,
              } as React.CSSProperties
            }
            className="sp-step sp-surface-1 flex items-center gap-3 px-4 text-sp-text"
          >
            <span className="sp-code shrink-0 text-sp-muted/60">
              {String(index + 1).padStart(2, "0")}
            </span>
            <StepIcon delayMs={delay} className={STEP_TONES[index]} />
            <span className="sp-body min-w-0 truncate">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Outcome() {
  return (
    <div
      style={{ "--sp-draw-delay": `${OUTCOME_MS}ms` } as React.CSSProperties}
      className="sp-outcome sp-lit px-5 py-5"
    >
      <Label className="text-sp-cobalt">One decision</Label>
      <p className="sp-h3 mt-2 text-sp-text">{SYNCPILOT_STEP.title}</p>
      <p className="sp-body mt-2 text-sp-muted">{SYNCPILOT_STEP.detail}</p>
      <div className="mt-4 flex items-center gap-2">
        <RefCode>{REF_CODE}</RefCode>
        <span className="sp-code text-sp-text">send</span>
      </div>
    </div>
  );
}

function Connectors() {
  return (
    <svg
      aria-hidden="true"
      width={CURVE_WIDTH}
      height={FIGURE_HEIGHT}
      viewBox={`0 0 ${CURVE_WIDTH} ${FIGURE_HEIGHT}`}
      fill="none"
      className="overflow-visible"
    >
      <defs>
        {/* Muted where the work starts, cobalt where it ends. */}
        <linearGradient
          id="sp-collapse"
          x1="0"
          y1="0"
          x2={CURVE_WIDTH}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#96897a" stopOpacity="0.22" />
          <stop offset="1" stopColor="#6c4de6" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Each line draws in just behind its own step. */}
      <g className="sp-draw">
        {MANUAL_STEPS.map((step, index) => (
          <path
            key={step}
            pathLength={1}
            d={curvePath(rowCentre(index))}
            stroke="url(#sp-collapse)"
            strokeWidth="1"
            style={
              {
                "--sp-draw-delay": `${index * STEP_STAGGER_MS + CONNECTOR_LEAD_MS}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </g>

      {/* One pulse per line, sweeping into the card once the lines are down. */}
      {MANUAL_STEPS.map((step, index) => (
        <path
          key={`pulse-${step}`}
          pathLength={1}
          d={curvePath(rowCentre(index))}
          stroke="#6c4de6"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="sp-pulse"
          style={
            {
              "--sp-draw-delay": `${PULSE_START_MS + index * 60}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}

export function DecisionCollapse() {
  return (
    <DrawOnView>
      <figure className="m-0">
        <div
          className="hidden sm:grid sm:items-center"
          style={{
            gridTemplateColumns: `minmax(0,1fr) ${CURVE_WIDTH}px minmax(0,1fr)`,
          }}
        >
          <ManualSteps />
          <Connectors />
          <Outcome />
        </div>

        {/* A horizontal funnel has nowhere to go on a phone: stack instead. */}
        <div className="flex flex-col gap-4 sm:hidden">
          <ManualSteps />
          <Outcome />
        </div>

        <figcaption className="sp-label mt-6 block normal-case tracking-[0.04em] text-sp-muted">
          Five decisions per email, down to one word.
        </figcaption>
      </figure>
    </DrawOnView>
  );
}
