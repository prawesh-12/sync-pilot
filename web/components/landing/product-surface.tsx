import { cn } from "@/lib/utils";

// Border is opt-in so panels do not all read as the same outlined box.
const PANEL = "rounded-xl bg-[#100E1C] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)]";
const PANEL_EDGE = "ring-1 ring-white/8";

export function Panel({
  edge = false,
  className,
  children,
}: {
  edge?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(PANEL, edge && PANEL_EDGE, className)}>{children}</div>
  );
}

export function Meta({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("font-mono-tech text-xs text-sp-muted", className)}>
      {children}
    </span>
  );
}

export function RefCode({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-[4px] bg-sp-amber/12 px-1.5 py-px font-mono-tech text-xs tracking-wider text-sp-amber">
      {children}
    </span>
  );
}

const DOT_TONES = {
  waiting: "bg-sp-amber",
  done: "bg-sp-sage",
  active: "bg-sp-cobalt",
};

export function StatusDot({
  tone,
  breathe = false,
}: {
  tone: keyof typeof DOT_TONES;
  breathe?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        DOT_TONES[tone],
        breathe && "sp-breathe",
      )}
    />
  );
}

const TEXT_TONES = {
  waiting: "text-sp-amber",
  done: "text-sp-sage",
  active: "text-sp-cobalt",
};

export function Status({
  tone,
  children,
}: {
  tone: keyof typeof TEXT_TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-mono-tech text-xs tracking-[0.12em] uppercase",
        TEXT_TONES[tone],
      )}
    >
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}
