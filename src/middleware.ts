// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UserRole } from "./lib/store/types";

const PUBLIC_PATHS = ["/login", "/signup", "/forget-password"];
const PROTECTED_PATHS = {
  "/inventory": ["OWNER", "ADMIN-ATTENDANT"],
  "/customers": ["OWNER", "ADMIN-ATTENDANT"],
  "/expenses": ["OWNER"],
  "/create-business": ["OWNER", "ADMIN-ATTENDANT", "ATTENDANT"],
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(path);

  // Check for access token
  const accessToken = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value as
    | UserRole
    | undefined;

  // Redirect logged-in users from public paths
  if (isPublicPath && accessToken) {
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
  matcher: ["/((?!api|_next/static|asset|_next/image|favicon.ico).*)"],
};
