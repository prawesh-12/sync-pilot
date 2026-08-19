import { ACTIVITY_STREAM } from "@/components/landing/landing-content";
import { Meta, StatusDot } from "@/components/landing/product-surface";

export function ActivitySection() {
  return (
    <section className="px-5 py-16 sm:px-6 md:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between sm:gap-16">
        <div>
          <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            It keeps running while you don&rsquo;t.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-sp-muted">
            A scheduled job sweeps Gmail and a worker polls Signal for replies.
            Nothing to keep open.
          </p>
        </div>

        <ul className="space-y-3 sm:min-w-[280px]">
          {ACTIVITY_STREAM.map((event) => (
            <li key={event.time} className="flex items-center gap-3.5">
              <StatusDot tone="active" breathe />
              <Meta>{event.time}</Meta>
              <span className="text-sm text-sp-muted">{event.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
