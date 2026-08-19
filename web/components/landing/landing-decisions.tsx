import { DECISIONS } from "@/components/landing/landing-content";

const ICON_SIZE = 17;

// The last decision spans the trailing row so the grid never ends on empty cells.
function getSpanClass(index: number) {
  if (index === DECISIONS.length - 1) {
    return "sm:col-span-2 lg:col-span-3";
  }

  return "";
}

export function LandingDecisions() {
  return (
    <section className="border-t border-sp-text/8 bg-[#A089E6]/[0.05]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Seven decisions. It picks one.
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-sp-muted">
          Not a drafting tool with a summarizer bolted on. Every email gets
          exactly one of these, and the reasoning behind it is recorded.
        </p>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-[10px] border border-sp-text/10 bg-sp-text/10 sm:grid-cols-2 lg:grid-cols-3">
          {DECISIONS.map(({ icon: Icon, name, detail }, index) => (
            <li
              key={name}
              className={`flex gap-3.5 bg-sp-base p-5 transition-colors duration-150 hover:bg-sp-text/5 ${getSpanClass(index)}`}
            >
              <Icon
                size={ICON_SIZE}
                strokeWidth={1.8}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-sp-amber"
              />
              <div>
                <h3 className="text-[15px] font-medium text-sp-text">{name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-sp-muted">
                  {detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
