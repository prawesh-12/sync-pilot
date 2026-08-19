"use client";

import { usePathname } from "next/navigation";

/**
 * The 2px violet bar pinned to the top of the viewport during navigation.
 * Keying the element on the pathname restarts its animation on every route
 * change, so no state or effect is involved.
 */
export function RouteProgress() {
  const pathname = usePathname();

  return (
    <span
      key={pathname}
      aria-hidden="true"
      className="sp-route-progress pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-sp-cobalt"
    />
  );
}
