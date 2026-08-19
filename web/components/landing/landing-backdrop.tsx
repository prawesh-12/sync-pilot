// Capped so the glow lands behind the hero, not halfway down a very tall page.
const GLOW_HEIGHT_PX = 1500;

export function LandingBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{ height: `${GLOW_HEIGHT_PX}px` }}
        className="pointer-events-none absolute inset-x-0 top-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]"
      />
    </>
  );
}
