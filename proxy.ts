import { NextResponse } from "next/server";

import { auth } from "@/auth";

const PUBLIC_PATHS = new Set(["/", "/login"]);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isPublicPath =
    PUBLIC_PATHS.has(pathname) || pathname.startsWith("/api/auth");
  const isAuthenticated = Boolean(req.auth);

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/profile", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
