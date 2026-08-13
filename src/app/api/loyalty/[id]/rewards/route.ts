import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { success: false, error: "id is required" },
      { status: 400 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}loyalty/rewards/${id}/`);

  const status = request.nextUrl.searchParams.get("status");
  if (status) apiUrl.searchParams.append("status", status);

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to fetch loyalty rewards",
          message: data.message || "Failed to fetch loyalty rewards",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Loyalty rewards fetched successfully",
    });
  } catch (error) {
    console.error("Error handling loyalty rewards:", error);
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
