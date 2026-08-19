// Height-bound because stretching the ellipse over this page washes it out.
const GLOW_HEIGHT_PX = 2400;

export function LandingBackdrop() {
  return (
    <>
      <div
        style={{ height: `${GLOW_HEIGHT_PX}px` }}
        className="pointer-events-none absolute inset-x-0 top-0 z-0 bg-[radial-gradient(ellipse_at_center,#271A58_0%,transparent_70%)]"
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#A089E620_1px,transparent_1px)] bg-size-[24px_24px]" />
    </>
  );
}
