import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "./lib/store/types";

const PUBLIC_PATHS = ["/login", "/signup", "/forget-password", "/unauthorized"];
// Customer-facing loyalty routes reached by scanning a campaign QR code. These
// are prefix matches because the token/code is part of the path, and unlike the
// auth pages a signed-in user must NOT be bounced away from them — a merchant
// testing their own QR should still see the join page.
const PUBLIC_PATH_PREFIXES = ["/loyalty/join", "/loyalty/progress"];
const PROTECTED_PATHS = {
  "/inventory": [
    "OWNER",
    "ADMIN-ATTENDANT",
    "ATTENDANT",
    "PHARMACIST",
    "PRODUCTION-MANAGER",
    "ACCOUNTANT",
    "INVENTORY-MANAGER",
  ],
  "/customers": ["OWNER", "ADMIN-ATTENDANT", "ACCOUNTANT"],
  "/expenses": ["OWNER", , "ADMIN-ATTENDANT", "ACCOUNTANT"],
  "/create-business": [
    "OWNER",
    "ADMIN-ATTENDANT",
    "ATTENDANT",
    "PHARMACIST",
    "PRODUCTION-MANAGER",
    "ACCOUNTANT",
    "INVENTORY-MANAGER",
  ],
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isCustomerLoyaltyPath = PUBLIC_PATH_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  );
  const isPublicPath = PUBLIC_PATHS.includes(path) || isCustomerLoyaltyPath;
  const isLogoutRedirect =
    request.nextUrl.searchParams.get("fromLogout") === "true";

  // Skip middleware for API routes, static files, and service worker
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path === "/firebase-messaging-sw.js" ||
    path.startsWith("/icons")
  ) {
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
  if (
    isPublicPath &&
    accessToken &&
    path !== "/unauthorized" &&
    !isCustomerLoyaltyPath
  ) {
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|icons).*)",
  ],
};
