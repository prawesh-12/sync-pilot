import Link from "next/link";
import { SyncPilotMark } from "@/components/landing/brand-marks";
import { glyphs, type GlyphName } from "@/components/landing/glyphs";
import { cn } from "@/lib/utils";

const ICON_SIZE_DEFAULT = 16;
const LOGO_SIZE = 22;

const WORD_STAGGER_MS = 60;

const pill =
  "q-medium inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap transition-[background-color,border-color,transform] duration-[120ms] ease-out hover:-translate-y-px";

export const primaryButton = cn(
  pill,
  "h-9 bg-q-invert px-4 text-[13px] text-q-on-invert shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)] hover:bg-q-invert-hover sm:h-10 sm:px-5 sm:text-sm",
);

export const ghostButton = cn(
  pill,
  "h-9 border border-q-line-3 bg-white/[0.02] px-4 text-[13px] text-q-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm hover:bg-white/[0.06] sm:h-10 sm:px-5 sm:text-sm",
);

export const navButton = cn(
  pill,
  "h-8 bg-q-invert px-4 text-[13px] text-q-on-invert hover:bg-q-invert-hover",
);

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("q-container", className)}>{children}</div>;
}

export function Icon({
  name,
  size = ICON_SIZE_DEFAULT,
  className,
}: {
  name: GlyphName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      data-icon=""
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0", className)}
      dangerouslySetInnerHTML={{ __html: glyphs[name] }}
    />
  );
}

export type StatusTone =
  | "neutral"
  | "info"
  | "attention"
  | "review"
  | "success"
  | "danger";

const STATUS_DOT_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-q-neutral",
  info: "bg-q-info",
  attention: "bg-q-attention",
  review: "bg-q-review",
  success: "bg-q-success",
  danger: "bg-q-danger",
};

export function StatusDot({ tone }: { tone: StatusTone }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_CLASSES[tone])}
    />
  );
}

export function BlurWords({
  text,
  startMs = 0,
  className,
}: {
  text: string;
  startMs?: number;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            className="q-blur-in"
            style={{ "--q-delay": `${startMs + index * WORD_STAGGER_MS}ms` } as React.CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

export function SectionIntro({
  id,
  eyebrow,
  title,
  quietTitle,
  lead,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  quietTitle?: string;
  lead: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[640px]", className)}>
      <p className="q-eyebrow text-q-brand-text">{eyebrow}</p>
      <h2 id={id} className="q-section-title mt-3 text-q-fg">
        {title}
        {quietTitle ? <span className="text-q-fg-3"> {quietTitle}</span> : null}
      </h2>
      <p className="q-lead mt-5 text-q-fg-2">{lead}</p>
    </div>
  );
}

export function LandingLogo() {
  return (
    <Link
      href="/"
      className="q-semibold inline-flex shrink-0 items-center gap-2 rounded-md text-[15px] tracking-tight text-q-fg"
    >
      <SyncPilotMark size={LOGO_SIZE} />
      SyncPilot
    </Link>
  );
}
