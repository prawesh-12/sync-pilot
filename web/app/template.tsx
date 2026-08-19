"use client";

import { RouteProgress } from "@/components/route-progress";

/**
 * Every route fades in as one unit. Individual elements are left alone here:
 * the Tier 2 scroll reveals take over once the page has settled, and running
 * both at once reads as a stutter.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteProgress />
      <div className="sp-route-enter flex flex-1 flex-col">{children}</div>
    </>
  );
}
