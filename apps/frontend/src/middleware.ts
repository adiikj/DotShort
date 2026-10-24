import { NextResponse, type NextRequest } from "next/server";

/**
 * Guard signed-in areas. Reads the non-sensitive session flag cookie set by
 * the client auth helper; real authorization still happens on the API
 * (every protected endpoint verifies the JWT server-side).
 */
export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("ds_session")?.value);

  if (!hasSession) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/links/:path*", "/analytics", "/qr", "/settings"],
};
