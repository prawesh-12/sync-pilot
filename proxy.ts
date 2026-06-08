import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/privacy/,
  /^\/terms/,
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/webhooks/,
  /^\/api\/cron\/fetch-emails/,
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
