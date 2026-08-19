const NOTES = [
  {
    term: "24-hour expiry",
    detail:
      "A draft you never confirm expires on its own. Nothing lingers in your outbox waiting to surprise you.",
  },
  {
    term: "Learns from overrides",
    detail:
      "Discard a draft or override a decision and that feeds back into future triage, so it makes the same mistake less often.",
  },
];

export function LandingRuntimeCard() {
  return (
    <div className="rounded-[10px] border border-sp-text/10 bg-sp-raised/40 p-6 sm:p-8">
      <p className="flex items-center gap-2 font-mono-tech text-[12px] tracking-wide text-sp-muted">
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-sp-amber"
        />
        Agentic AI, powered by Groq
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
        Fast, and built to keep running
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-sp-muted">
        Triage runs on Groq, so reading an email and committing to a decision
        takes seconds rather than the better part of a minute. The whole thing
        runs as a scheduled background job — there is no tab to leave open and
        no app to babysit.
      </p>

      <dl className="mt-6 space-y-4 border-t border-sp-text/10 pt-6">
        {NOTES.map((note) => (
          <div key={note.term}>
            <dt className="font-mono-tech text-[12px] tracking-wide text-sp-amber">
              {note.term}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-sp-muted">
              {note.detail}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
