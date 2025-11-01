import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic route protection middleware using Better Auth cookie helpers.
 *
 * - Fast, optimistic redirects based on the presence of a session cookie.
 * - Not a full security check — pages and server actions should still verify
 *   the session server-side via `auth.api.getSession`.
 *
 * This middleware follows Better Auth recommendations for optimistic redirects.
 */

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/favicon.ico",
  "/_next",
  "/static",
  "/public",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets and static files
  if (
    isPublic(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);

  // If user has a session cookie and is on auth pages, send them to dashboard
  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // If no session cookie and trying to access protected routes, redirect to login
  const protectedPrefixes = ["/dashboard", "/onboarding"];
  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!sessionCookie && isProtected) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, allow the request. Full validation should happen server-side.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
