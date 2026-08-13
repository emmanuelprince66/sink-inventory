import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  const { rewardId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  if (!rewardId) {
    return NextResponse.json(
      { success: false, error: "rewardId is required" },
      { status: 400 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}loyalty/rewards/${rewardId}/redeem/`);

  try {
    const payload = await request.json();

    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to create reward",
          message: data.message || "Failed to create reward",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Reward redeemed successfully",
    });
  } catch (error) {
    console.error("Error handling reward:", error);
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
