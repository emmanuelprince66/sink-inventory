import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Every route under app/api is the same shape: read the access token from the
 * httpOnly cookie, forward the call to the Django API, and normalise whatever
 * comes back into { success, data, message }. Writing that out per handler ran
 * to ~60 lines each and drifted — some forwarded query params, some didn't.
 */
export interface ProxyOptions {
  /** Path on the API, without a leading slash. BaseUrl already ends in one. */
  path: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Query params to carry over from the incoming request, if present. */
  forwardParams?: string[];
  /** Names the operation in error and success messages. */
  label: string;
  /** Params that must be present on the incoming request. */
  requireParams?: string[];
}

export const proxyToApi = async (
  request: NextRequest,
  {
    path,
    method = "GET",
    forwardParams = [],
    label,
    requireParams = [],
  }: ProxyOptions,
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  const incoming = request.nextUrl.searchParams;

  const missing = requireParams.filter((name) => !incoming.get(name));
  if (missing.length) {
    return NextResponse.json(
      {
        success: false,
        error: `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required`,
      },
      { status: 400 },
    );
  }

  const apiUrl = new URL(`${BaseUrl}${path}`);
  for (const name of forwardParams) {
    const value = incoming.get(name);
    if (value) apiUrl.searchParams.set(name, value);
  }

  try {
    const hasBody = method !== "GET" && method !== "DELETE";

    const response = await fetch(apiUrl.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      ...(hasBody
        ? { body: JSON.stringify(await request.json().catch(() => ({}))) }
        : {}),
      cache: "no-store",
    });

    // 204s and empty bodies are legitimate on PATCH/DELETE.
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.error ?? `Failed to ${label}`,
          message: data?.message ?? `Failed to ${label}`,
          data,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: `${label} succeeded`,
    });
  } catch (error) {
    console.error(`Error proxying ${label}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
};
