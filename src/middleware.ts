// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/create-business",
  "/forgot-password",
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(path);

  // Check for access token
  const accessToken = request.cookies.get("accessToken")?.value;

  if (isPublicPath && accessToken) {
    // If user is logged in and tries to access public path, redirect to overview
    return NextResponse.redirect(new URL("/overview", request.nextUrl));
  }

  if (!isPublicPath && !accessToken) {
    // If user is not logged in and tries to access protected path, redirect to login
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}

// Match all routes except static files and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
