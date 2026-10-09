import type { DecisionValue } from "@/db/schema";
import { getDecisionLabel } from "@/lib/decisions";
import {
  SAMPLE_DECISIONS,
  type SampleDecision,
} from "@/components/landing/landing-content";
import {
  Container,
  SectionIntro,
  StatusDot,
  type StatusTone,
} from "@/components/landing/landing-ui";
import { Reveal } from "@/components/landing/reveal";

const HEADING_ID = "actions-title";

const DECISION_TONES: Record<DecisionValue, StatusTone> = {
  draft_reply: "attention",
  escalate: "danger",
  summarize_notify: "info",
  apply_label: "review",
  archive: "neutral",
  snooze: "neutral",
  ignore: "neutral",
};

function DecisionRow({ item }: { item: SampleDecision }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_120px_112px] sm:px-5">
      <div className="min-w-0">
        <p className="truncate text-sm q-medium text-q-fg">{item.subject}</p>
        <p className="mt-0.5 truncate text-[13px] text-q-fg-3">{item.reasoning}</p>
      </div>
      <span className="flex items-center gap-2 text-[13px] text-q-fg-2">
        <StatusDot tone={DECISION_TONES[item.decision]} />
        {getDecisionLabel(item.decision)}
      </span>
      <span className="hidden text-right text-xs text-q-fg-4 sm:block">{item.when}</span>
    </li>
  );
}

function DecisionList() {
  return (
    <div className="q-surface overflow-hidden rounded-2xl">
      <div className="flex h-11 items-center justify-between border-b border-q-line px-4 sm:px-5">
        <span className="text-[13px] q-medium text-q-fg">Recent decisions</span>
        <span className="q-tnum text-[13px] text-q-fg-4">{SAMPLE_DECISIONS.length}</span>
      </div>
      <ul className="divide-y divide-q-line">
        {SAMPLE_DECISIONS.map((item) => (
          <DecisionRow key={item.subject} item={item} />
        ))}
      </ul>
    </div>
  );
}

export function ActionsSection() {
  return (
    <section id="actions" aria-labelledby={HEADING_ID} className="q-section">
      <Container>
        <Reveal>
          <SectionIntro
            id={HEADING_ID}
            eyebrow="Seven actions"
            title="One decision per email,"
            quietTitle="with the reason written down."
            lead="Draft, escalate, summarize, label, archive, snooze or ignore. Each choice lands in your dashboard with a one-line reason, so you can see why it did what it did."
          />
        </Reveal>

        <Reveal className="mt-14">
          <DecisionList />
        </Reveal>
      </Container>
    </section>
  );
}
