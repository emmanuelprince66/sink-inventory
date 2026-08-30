import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * The same progress lookup backs the merchant POS and the customer-facing join
 * and progress pages, so auth is optional: the record is addressed by loyalty
 * code and nothing about it depends on who asks. `?public=1` drops the header
 * outright — a stale merchant cookie left in a phone's browser would otherwise
 * be rejected while the API authenticates, before the endpoint's public
 * permission is ever considered.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loyaltyCode: string }> }
) {
  const { loyaltyCode } = await params;

  const isPublic = request.nextUrl.searchParams.get("public") === "1";
  const cookieStore = await cookies();
  const accessToken = isPublic
    ? undefined
    : cookieStore.get("accessToken")?.value;

  if (!loyaltyCode) {
    return NextResponse.json(
      { success: false, error: "loyaltyCode is required" },
      { status: 400 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}loyalty/progress/${loyaltyCode}/`);

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.error || "Failed to fetch loyalty progress",
          message:
            data?.message || data?.detail || "Failed to fetch loyalty progress",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Loyalty progress fetched successfully",
    });
  } catch (error) {
    console.error("Error handling loyalty progress:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
