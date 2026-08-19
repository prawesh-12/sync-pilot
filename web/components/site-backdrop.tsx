import { cn } from "@/lib/utils";

/**
 * The one backdrop, on every route: a violet glow over a fine dot grid. The
 * landing page pins the glow to a fixed height, because stretching one ellipse
 * down a page that long washes it out; product pages let it fill the frame.
 */

const LANDING_GLOW_HEIGHT_PX = 2400;

export function SiteBackdrop({
  /** Landing runs the glow at full strength; product pages sit it further back. */
  tone = "muted",
  /** Caps the glow's height instead of letting it fill the container. */
  glowHeightPx,
}: {
  tone?: "full" | "muted";
  glowHeightPx?: number;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        style={glowHeightPx ? { height: `${glowHeightPx}px` } : undefined}
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)]",
          glowHeightPx ? undefined : "bottom-0",
          tone === "muted" && "opacity-60",
        )}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]"
      />
    </>
  );
}

/** The landing page's setting: full-strength glow, height-bound. */
export function LandingBackdrop() {
  return <SiteBackdrop tone="full" glowHeightPx={LANDING_GLOW_HEIGHT_PX} />;
}
