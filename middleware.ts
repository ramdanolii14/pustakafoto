import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Lightweight: only block banned users on page navigations
  // Ban enforcement happens at API level too for safety
  const { pathname } = req.nextUrl;

  // Skip static, auth, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/favicon.ico" ||
    pathname === "/banned"
  ) {
    return NextResponse.next();
  }

  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) return NextResponse.next();

  try {
    const res = await fetch(`${req.nextUrl.origin}/api/admin/check-ban`, {
      headers: { cookie: req.headers.get("cookie") || "" },
    });
    if (res.ok) {
      const { banned } = await res.json();
      if (banned) {
        return NextResponse.redirect(new URL("/banned", req.url));
      }
    }
  } catch {
    // Fail open
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/post/:path*", "/profile/:path*", "/edit/:path*", "/admin/:path*"],
};