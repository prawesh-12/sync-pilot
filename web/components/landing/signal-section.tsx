import { REPLY_COMMANDS } from "@/components/landing/landing-content";
import { SignalThread } from "@/components/landing/signal-thread";

function Commands() {
  return (
    <ul className="mt-10 space-y-3">
      {REPLY_COMMANDS.map((entry) => (
        <li key={entry.command} className="flex flex-wrap items-baseline gap-x-3">
          <code className="font-mono-tech text-sm text-sp-amber">
            {entry.command}
          </code>
          <span className="text-sm text-sp-muted">{entry.result}</span>
        </li>
      ))}
    </ul>
  );
}

export function SignalSection() {
  return (
    <section className="px-5 py-16 sm:px-6 md:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
        <div>
          <h2 className="max-w-lg font-display text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl">
            The whole workflow collapses into four characters and a word.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-sp-muted">
            No dashboard to open, no app to install. It arrives in Signal, which
            is already on your phone and encrypted end to end.
          </p>
          <Commands />
          <p className="mt-10 max-w-md text-xs leading-relaxed text-sp-muted">
            SyncPilot connects through Signal&rsquo;s own client protocol using a
            self-hosted signal-cli bridge. It is not affiliated with or endorsed
            by Signal.
          </p>
        </div>

        <div className="lg:justify-self-end">
          <SignalThread />
        </div>
      </div>
    </section>
  );
}
