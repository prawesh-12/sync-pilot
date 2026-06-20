import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/how-to-use/,
  /^\/privacy/,
  /^\/terms/,
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/webhooks/,
  // All cron routes authenticate via the cron secret in their own handlers.
  /^\/api\/cron(\/.*)?$/,
  // Machine-to-machine routes called by the EC2 worker; they authenticate via
  // the SYNC_SECRET (x-secret header) in their own handlers, so the session
  // middleware must not redirect them to /sign-in. Keep /api/agent/run-job
  // exact so the session-protected /api/agent/run stays behind auth.
  /^\/api\/agent\/run-job\/?$/,
  /^\/api\/internal(\/.*)?$/,
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, AND the landing page (/) which needs no auth
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))(?!$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
