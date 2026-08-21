import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  if (!programId) {
    return NextResponse.json(
      { success: false, error: "programId is required" },
      { status: 400 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}loyalty/programs/${programId}/enrollments/`);

  const search = request.nextUrl.searchParams.get("search");
  if (search) apiUrl.searchParams.append("search", search);
  const page = request.nextUrl.searchParams.get("page");
  if (page) apiUrl.searchParams.append("page", page);
  const limit = request.nextUrl.searchParams.get("limit");
  if (limit) apiUrl.searchParams.append("limit", limit);

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
          error: data.error || "Failed to fetch loyalty enrollments",
          message: data.message || "Failed to fetch loyalty enrollments",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Loyalty enrollments fetched successfully",
    });
  } catch (error) {
    console.error("Error handling loyalty enrollments:", error);
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
