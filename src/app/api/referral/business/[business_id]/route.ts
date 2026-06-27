import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Proxies GET /referral/business/{business_id}/ — full reward breakdown for
// one referred business (allocation, percentage_earned, recent_activity).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ business_id: string }> },
) {
  const { business_id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  if (!business_id) {
    return NextResponse.json(
      { success: false, error: "business_id is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${BaseUrl}referral/business/${business_id}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch referral details",
          error: data.error || null,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
        message: "Referral details fetched successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Server error:", error);
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
}
