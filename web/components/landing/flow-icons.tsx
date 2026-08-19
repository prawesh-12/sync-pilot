import { ICON_STROKE } from "@/components/landing/landing-icons";
import { cn } from "@/lib/utils";

/**
 * This section's own line art. Hand-drawn rather than taken from the icon
 * library because every path needs `pathLength="1"` to draw itself in over a
 * single keyframe, which a library glyph gives no way to set.
 */

type FlowIconProps = {
  size?: number;
  className?: string;
  /** Milliseconds to wait before this icon starts drawing. */
  delayMs?: number;
};

function Icon({
  size = 22,
  className,
  delayMs = 0,
  children,
}: FlowIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ "--sp-draw-delay": `${delayMs}ms` } as React.CSSProperties}
      className={cn("sp-draw shrink-0", className)}
    >
      {children}
    </svg>
  );
}

/** Step 01 — the inbox, opened. */
export function EnvelopeIcon(props: FlowIconProps) {
  return (
    <Icon {...props}>
      {/* Separate closed shapes on purpose: run
          together they read as a house at 22px rather than an open envelope. */}
      <path pathLength={1} d="M3 10.2h18V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8.8Z" />
      <path pathLength={1} d="M3 10.2 12 4.2l9 6" />
    </Icon>
  );
}

/** Step 02 — reading it. */
export function EyeIcon(props: FlowIconProps) {
  return (
    <Icon {...props}>
      <path
        pathLength={1}
        d="M2.6 12S6.1 5.6 12 5.6 21.4 12 21.4 12 17.9 18.4 12 18.4 2.6 12 2.6 12Z"
      />
      <path pathLength={1} d="M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" />
    </Icon>
  );
}

/** Step 03 — weighing what it needs. Also "You decide" in the grid below. */
export function ScalesIcon(props: FlowIconProps) {
  return (
    <Icon {...props}>
      <path pathLength={1} d="M12 4.4v15.2" />
      <path pathLength={1} d="M5 7.8h14" />
      <path pathLength={1} d="M5 7.8 2.2 13.2h5.6L5 7.8Z" />
      <path pathLength={1} d="M19 7.8l-2.8 5.4h5.6L19 7.8Z" />
      <path pathLength={1} d="M8.6 19.6h6.8" />
    </Icon>
  );
}

/** Step 04 — writing the reply. Also "It writes" in the grid below. */
export function NibIcon(props: FlowIconProps) {
  return (
    <Icon {...props}>
      <path pathLength={1} d="m16.4 3.4 4.2 4.2L8 20.2l-5.4 1.2L3.8 16 16.4 3.4Z" />
      <path pathLength={1} d="m13.3 6.5 4.2 4.2" />
      <path pathLength={1} d="m3.8 16 4.2 4.2" />
    </Icon>
  );
}

/** Step 05 — sending it. */
export function PlaneIcon(props: FlowIconProps) {
  return (
    <Icon {...props}>
      <path pathLength={1} d="M21.4 2.8 2.6 10.1l7.3 2.9 2.9 7.3 8.6-17.5Z" />
      <path pathLength={1} d="M21.4 2.8 9.9 13" />
    </Icon>
  );
}
