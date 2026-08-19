import { FACTS } from "@/components/landing/landing-content";

export function LandingFacts() {
  return (
    <section
      aria-label="How SyncPilot operates"
      className="border-y border-sp-text/8"
    >
      <div className="mx-auto grid w-full max-w-6xl divide-y divide-sp-text/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {FACTS.map((fact) => (
          <div key={fact.stat} className="px-5 py-7 sm:px-6">
            <p className="font-mono-tech text-[13px] tracking-wide text-sp-amber">
              {fact.stat}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-sp-muted">
              {fact.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
