import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * The bit every route handler in here was repeating.
 *
 * Each of these routes does the same four things — read the access token off
 * the cookie, forward to the upstream API, pass an upstream failure through
 * with its status intact, and never let an exception escape as an HTML error
 * page. Written out per route that came to seventy lines each, and the
 * expense-governance feature adds ten more of them.
 *
 * The token stays server-side: it lives in an httpOnly cookie the browser
 * cannot read, which is the whole reason these proxies exist rather than the
 * client calling the API directly.
 */

interface ProxyOptions {
  /** Upstream path after BaseUrl, e.g. "expenses/settings/<id>/". */
  path: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Parsed JSON body for writes. Omitted on GET. */
  body?: unknown;
  /** Query string to forward, already filtered. */
  search?: URLSearchParams;
  /** Message shown when the upstream call fails without one of its own. */
  errorMessage?: string;
}

export const proxyToApi = async ({
  path,
  method = "GET",
  body,
  search,
  errorMessage = "Request failed",
}: ProxyOptions) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  const url = new URL(`${BaseUrl}${path}`);
  search?.forEach((value, key) => url.searchParams.append(key, value));

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    // A failure body is not guaranteed to be JSON — an upstream 502 from a
    // proxy in front of the API is HTML — so parsing is allowed to fail
    // rather than turning a bad gateway into an unhandled exception here.
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: payload?.message || payload?.detail || errorMessage,
          details: payload,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { success: true, data: payload },
      { status: response.status === 201 ? 201 : 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};

/**
 * A request's JSON body, or a 400 describing why it could not be read.
 *
 * Returned as a tuple rather than thrown so the caller stays a flat function
 * with no try/catch of its own.
 */
export const readJsonBody = async (
  request: Request,
): Promise<[unknown, null] | [null, NextResponse]> => {
  try {
    return [await request.json(), null];
  } catch {
    return [
      null,
      NextResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 },
      ),
    ];
  }
};

/** Forwards only the query params a route actually supports, skipping blanks. */
export const pickSearchParams = (
  request: Request,
  allowed: readonly string[],
): URLSearchParams => {
  const incoming = new URL(request.url).searchParams;
  const out = new URLSearchParams();

  allowed.forEach((key) => {
    const value = incoming.get(key);
    // "ALL" is the list endpoint's default and means "no status filter", so
    // it is dropped rather than sent as a status the backend has to special-case.
    if (value && value !== "ALL") out.append(key, value);
  });

  return out;
};
