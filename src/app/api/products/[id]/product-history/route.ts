import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  const type = request.nextUrl.searchParams.get("type") || "";
  const page = request.nextUrl.searchParams.get("page") || "";
  const limit = request.nextUrl.searchParams.get("limit") || "";

  const apiUrl = new URL(`${BaseUrl}product/return/${id}/`);
  if (type) apiUrl.searchParams.append("type", type);
  if (page) apiUrl.searchParams.append("page", page);
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

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch product history data",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Product history data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching product history data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
