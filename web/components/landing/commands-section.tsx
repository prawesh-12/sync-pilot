import {
  REPLY_COMMANDS,
  type CommandRow,
  type CommandTone,
} from "@/components/landing/landing-content";
import {
  Container,
  SectionIntro,
  StatusDot,
  type StatusTone,
} from "@/components/landing/landing-ui";
import { Reveal } from "@/components/landing/reveal";
import { SignalThread } from "@/components/landing/signal-thread";

const HEADING_ID = "commands-title";
const VISUAL_DELAY_MS = 80;

const OUTCOME_TONES: Record<CommandTone, StatusTone> = {
  sent: "success",
  discarded: "neutral",
  revised: "review",
};

function CommandItem({ row }: { row: CommandRow }) {
  return (
    <li className="flex items-start justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="q-mono inline-block rounded-[5px] bg-q-raised px-2 py-0.5 text-q-fg">
          {row.command}
        </p>
        <p className="mt-2 text-sm text-q-fg-3">{row.result}</p>
      </div>
      <span className="mt-0.5 flex shrink-0 items-center gap-2 text-[13px] text-q-fg-2">
        <StatusDot tone={OUTCOME_TONES[row.tone]} />
        {row.outcome}
      </span>
    </li>
  );
}

export function CommandsSection() {
  return (
    <section id="commands" aria-labelledby={HEADING_ID} className="q-section">
      <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <SectionIntro
            id={HEADING_ID}
            eyebrow="Replies"
            title="Three replies cover everything."
            lead="Answer with the draft's code and a word. Anything other than send or no is read as an edit."
          />
          <ul className="mt-10 divide-y divide-q-line border-y border-q-line">
            {REPLY_COMMANDS.map((row) => (
              <CommandItem key={row.command} row={row} />
            ))}
          </ul>
        </Reveal>

        <Reveal delay={VISUAL_DELAY_MS}>
          <SignalThread />
        </Reveal>
      </Container>
    </section>
  );
}
