// app/api/(customer)/customer/[id]/route.ts
import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Await the params promise
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  const year = request.nextUrl.searchParams.get("year") || "";

  // Build the API URL
  const apiUrl = new URL(`${BaseUrl}analytic/sales_analytics/${id}/`);
  if (year) apiUrl.searchParams.append("year", year);

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
        { error: errorData.message || "Failed to fetch sales analytic data" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Sales analytic data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching sales analytic data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
