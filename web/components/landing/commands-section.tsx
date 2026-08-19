"use client";

import { useEffect, useState } from "react";
import {
  ACTIVITY_FACTS,
  ACTIVITY_START_MINUTES,
  ACTIVITY_STREAM,
  REPLY_COMMANDS,
  type CommandRow,
} from "@/components/landing/landing-content";
import { activityIcon, Glyph, OutcomeIcons } from "@/components/landing/landing-icons";
import {
  Container,
  Label,
  Panel,
  Section,
  StatusDot,
} from "@/components/landing/layout-primitives";
import { Reveal, useRevealed } from "@/components/landing/reveal";

const ROW_INTERVAL_MS = 2500;
const VISIBLE_ROWS = 5;
const MINUTES_PER_DAY = 24 * 60;

// Each row plays its outcome in turn once the table comes into view.
const OUTCOME_STAGGER_MS = 500;

const OUTCOME_TONES = {
  sent: "text-sp-sage",
  discarded: "text-sp-muted",
  revised: "text-sp-cobalt",
} as const;

/* -- Command table --------------------------------------------------------- */

function CommandTable() {
  const { ref, isRevealed } = useRevealed<HTMLDivElement>();

  return (
    <div ref={ref}>
      <div className="sp-surface-1 overflow-hidden">
        <div className="hidden items-baseline gap-6 border-b border-white/7 px-6 py-4 sm:flex">
          <Label className="w-48 shrink-0">You reply</Label>
          <Label>It does</Label>
        </div>
        <ul>
          {REPLY_COMMANDS.map((entry, index) => (
            <CommandTableRow
              key={entry.command}
              entry={entry}
              on={isRevealed}
              delay={index * OUTCOME_STAGGER_MS}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function CommandTableRow({
  entry,
  on,
  delay,
}: {
  entry: CommandRow;
  on: boolean;
  delay: number;
}) {
  return (
    <li
      data-on={on ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
      className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/7 px-6 py-4 transition-colors duration-150 last:border-b-0 hover:bg-white/4 data-[on=true]:bg-white/3"
    >
      <code className="sp-code w-full shrink-0 text-sp-amber sm:w-48">
        {entry.command}
      </code>
      <span className="sp-body min-w-0 flex-1 text-sp-muted">{entry.result}</span>
      {/* Reserved width, so the outcome sliding in never reflows the row. */}
      <span className="flex w-full shrink-0 sm:w-32 sm:justify-end">
        <Reveal
          delay={delay}
          className={`sp-code inline-flex items-center gap-2 ${OUTCOME_TONES[entry.tone]}`}
        >
          <Glyph icon={OutcomeIcons[entry.tone]} />
          {entry.outcome}
        </Reveal>
      </span>
    </li>
  );
}

/* -- Activity log ---------------------------------------------------------- */

function clockAt(index: number) {
  // Sum every gap up to this index, so the clock only ever runs forward.
  let minutes = ACTIVITY_START_MINUTES;

  for (let step = 0; step <= index; step += 1) {
    minutes += ACTIVITY_STREAM[step % ACTIVITY_STREAM.length].gapMinutes;
  }

  const wrapped = minutes % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);

  return `${String(hours).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

function ActivityLog() {
  const [head, setHead] = useState(VISIBLE_ROWS - 1);

  useEffect(() => {
    const tick = window.setInterval(
      () => setHead((current) => current + 1),
      ROW_INTERVAL_MS,
    );

    return () => window.clearInterval(tick);
  }, []);

  const rows = Array.from({ length: VISIBLE_ROWS }, (_, offset) => {
    const index = head - (VISIBLE_ROWS - 1) + offset;

    return {
      index,
      time: clockAt(index),
      ...ACTIVITY_STREAM[index % ACTIVITY_STREAM.length],
    };
  });

  return (
    <div className="sp-surface-1 flex h-[280px] flex-col overflow-hidden px-6 py-4">
      <div className="flex shrink-0 items-center justify-between">
        <Label>Activity</Label>
        <span className="flex items-center gap-2">
          <span className="sp-breathe">
            <StatusDot tone="done" />
          </span>
          <Label className="text-sp-sage">Live</Label>
        </span>
      </div>

      <ul className="mt-4 flex flex-1 flex-col justify-end gap-3">
        {rows.map((row, position) => {
          return (
            <li
              key={row.index}
              className={`sp-log-in flex h-6 min-w-0 shrink-0 items-center gap-3 ${
                position === 0 ? "sp-log-out" : ""
              }`}
            >
              <Glyph icon={activityIcon(row.kind)} className="shrink-0 text-sp-muted" />
              <Label className="shrink-0 normal-case tracking-[0.04em]">
                {row.time}
              </Label>
              <span className="sp-code min-w-0 truncate text-sp-muted">{row.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -- Section --------------------------------------------------------------- */

export function CommandsSection() {
  return (
    <Section id="commands">
      {/* Measured at 600px of content at a 900px viewport: the table, the log
          and the three stats all fit one panel, so none of it is split off. */}
      <Panel label="Commands">
        <Container>
          <h2 className="sp-h2 sp-measure text-sp-text">
            Four characters and one word. That is the whole thing.
          </h2>
          <p className="sp-body sp-measure mt-12 text-sp-muted">
            No dashboard to open and no app to install. The draft arrives in
            Signal, which is already on your phone.
          </p>

          <div className="mt-12 grid gap-16 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-7">
              <CommandTable />
            </div>
            <div className="min-w-0 lg:col-span-5">
              <ActivityLog />
            </div>
          </div>

          <ul className="mt-16 grid gap-6 sm:grid-cols-3">
            {ACTIVITY_FACTS.map((fact, index) => (
              <Reveal as="li" key={fact.label} delay={index * 70}>
                <p className="sp-h3 text-sp-text">{fact.value}</p>
                <Label className="mt-2 block">{fact.label}</Label>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Panel>
    </Section>
  );
}
