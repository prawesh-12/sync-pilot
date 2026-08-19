import { cn } from "@/lib/utils";

/**
 * The page's single container, so every left edge lines up down the page. A
 * section may bleed its background full width, but never its content.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("sp-container", className)}>{children}</div>;
}

/**
 * The semantic wrapper and anchor target: it holds one or more panels and
 * carries the id the nav links to. Vertical rhythm belongs to the panels.
 */
export function Section({
  id,
  className,
  children,
  ...rest
}: React.ComponentProps<"section">) {
  return (
    <section id={id} className={className} {...rest}>
      {children}
    </section>
  );
}

/**
 * One snap stop, a viewport tall, holding only what fits at a 900px viewport
 * height — mandatory snapping makes anything below a panel's fold unreachable.
 *
 * Top padding rather than scroll-margin-top, so the heading clears the sticky
 * nav without moving the snap position.
 */
export function Panel({
  id,
  label,
  end,
  className,
  children,
  ...rest
}: React.ComponentProps<"div"> & {
  /** Names this stop for the section indicator and its screen reader label. */
  label: string;
  /** The closing panel, which ends on the footer rather than centred. */
  end?: boolean;
}) {
  return (
    <div
      id={id}
      data-snap-panel=""
      data-panel-label={label}
      className={cn("sp-panel", end && "sp-panel-end", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Mono eyebrow / column label. */
export function Label({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("sp-label text-sp-muted", className)}>{children}</span>
  );
}

/** The amber ref code treatment, used everywhere a code appears. */
export function RefCode({ children }: { children: React.ReactNode }) {
  return (
    <span className="sp-code inline-block rounded-[4px] bg-sp-amber/12 px-1.5 tracking-wider text-sp-amber">
      {children}
    </span>
  );
}

const DOT_TONES = {
  waiting: "bg-sp-amber",
  done: "bg-sp-sage",
  active: "bg-sp-cobalt",
};

export function StatusDot({ tone }: { tone: keyof typeof DOT_TONES }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", DOT_TONES[tone])}
    />
  );
}
