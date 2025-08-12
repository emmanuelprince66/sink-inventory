// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "./lib/store/types";

const PUBLIC_PATHS = ["/login", "/signup", "/forget-password", "/unauthorized"];
const PROTECTED_PATHS = {
  "/inventory": ["OWNER", "ADMIN-ATTENDANT"],
  "/customers": ["OWNER", "ADMIN-ATTENDANT"],
  "/expenses": ["OWNER"],
  "/create-business": ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(path);
  const isLogoutRedirect =
    request.nextUrl.searchParams.get("fromLogout") === "true";

  // Skip middleware for API routes and static files
  if (path.startsWith("/api") || path.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Allow logout redirect flow to complete
  if (isLogoutRedirect) {
    return NextResponse.next();
  }

  // Check for access token
  const accessToken = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value as
    | UserRole
    | undefined;

  // Redirect logged-in users from public paths
  if (isPublicPath && accessToken && path !== "/unauthorized") {
    return NextResponse.redirect(new URL("/pos", request.nextUrl));
  }

  // Redirect unauthenticated users from protected paths
  if (!isPublicPath && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Check role-based permissions
  for (const [protectedPath, allowedRoles] of Object.entries(PROTECTED_PATHS)) {
    if (path.startsWith(protectedPath)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", request.nextUrl));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
