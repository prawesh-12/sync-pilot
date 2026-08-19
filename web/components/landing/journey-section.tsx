import { JOURNEY } from "@/components/landing/landing-content";
import { Meta } from "@/components/landing/product-surface";
import { cn } from "@/lib/utils";

const LAST_INDEX = JOURNEY.length - 1;

function Station({
  station,
  index,
}: {
  station: (typeof JOURNEY)[number];
  index: number;
}) {
  const isFinal = index === LAST_INDEX;

  return (
    <li className="relative flex-1 pt-8 pl-7 md:pt-10 md:pl-0">
      <span
        aria-hidden="true"
        className={cn(
          "absolute size-2 rounded-full ring-4 ring-sp-base",
          "top-8 -left-1 md:top-[26px] md:left-0",
          isFinal ? "bg-sp-sage" : "bg-sp-cobalt/70",
        )}
      />
      <Meta className="uppercase tracking-[0.14em]">{station.system}</Meta>
      <p
        className={cn(
          "mt-2 text-base leading-snug font-medium md:text-base",
          isFinal ? "text-sp-sage" : "text-sp-text",
        )}
      >
        {station.title}
      </p>
      <Meta className="mt-1 block">{station.meta}</Meta>
    </li>
  );
}

export function JourneySection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 md:py-24">
      <h2 className="max-w-2xl font-display text-2xl leading-tight font-semibold tracking-tight sm:text-4xl">
        One message, five systems, one word from you.
      </h2>

      <ol className="relative mt-12 flex flex-col md:mt-16 md:flex-row md:gap-6">
        <span
          aria-hidden="true"
          className="absolute top-8 bottom-8 left-0 w-px bg-white/10 md:top-[30px] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto"
        />
        {JOURNEY.map((station, index) => (
          <Station key={station.system + station.title} station={station} index={index} />
        ))}
      </ol>
    </section>
  );
}
