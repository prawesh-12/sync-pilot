import {
  DECISION_LEGEND,
  SAMPLE_DECISIONS,
  type SampleDecision,
} from "@/components/landing/landing-content";
import { decisionIcon, Glyph } from "@/components/landing/landing-icons";
import {
  Container,
  Label,
  Panel,
  Section,
} from "@/components/landing/layout-primitives";
import { Reveal } from "@/components/landing/reveal";
import { getDecisionBadgeClass, getDecisionLabel } from "@/lib/decisions";
import type { DecisionValue } from "@/db/schema";

/**
 * The agent decisions view, rendered from the same badge helpers the real page
 * uses so the colours cannot drift apart. The rows carry sample data on purpose:
 * no real subject line or sender ever goes on a public page.
 */

function Badge({ decision }: { decision: DecisionValue }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${getDecisionBadgeClass(decision)}`}
    >
      <Glyph icon={decisionIcon(decision)} size={14} />
      {getDecisionLabel(decision)}
    </span>
  );
}

function DecisionRow({ row }: { row: SampleDecision }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-[#A089E6]/10 bg-white/3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-white">{row.subject}</p>
        <p className="text-xs text-gray-500">{row.reasoning}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge decision={row.decision} />
        <span className="text-xs text-gray-500">{row.when}</span>
      </div>
    </li>
  );
}

export function DecisionsSection() {
  return (
    <Section id="decisions">
      {/* One panel, in two columns. Stacked, the heading, the log and the
          legend measure about 920px and would not fit a 900px viewport; beside
          each other the panel is only as tall as the log, at about 600px. */}
      <Panel label="Decisions">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h2 className="sp-h2 text-sp-text">See why it did what it did.</h2>
              <p className="sp-body mt-6 text-sp-muted">
                Every email gets a decision and a reason. Open the log any time
                and read back what SyncPilot chose, and why it chose it.
              </p>

              <div className="mt-8">
                <Label>Every badge it can give you</Label>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {DECISION_LEGEND.map((decision) => (
                    <li key={decision}>
                      <Badge decision={decision} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-8">
              <Reveal className="relative">
                <div className="sp-surface-2 overflow-hidden p-4 md:p-6">
                  <div className="mb-4 flex items-baseline justify-between gap-4">
                    <p className="text-lg font-semibold text-white">
                      Agent Decisions
                    </p>
                    <Label>Sample data</Label>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {SAMPLE_DECISIONS.map((row) => (
                      <DecisionRow key={row.subject} row={row} />
                    ))}
                  </ul>
                </div>
                {/* Softens the bottom edge into the page instead of a hard cut. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[14px] bg-gradient-to-b from-transparent to-sp-base"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Panel>
    </Section>
  );
}
