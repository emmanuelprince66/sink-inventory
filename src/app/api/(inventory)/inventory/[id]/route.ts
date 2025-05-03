// app/api/(customer)/customer/[id]/route.ts
import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params promise
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  const search = request.nextUrl.searchParams.get("search") || "";
  const type = request.nextUrl.searchParams.get("type") || "";
  const category_id = request.nextUrl.searchParams.get("category_id") || "";

  // Build the API URL
  const apiUrl = new URL(`${BaseUrl}product/business/${id}/`);
  if (search) apiUrl.searchParams.append("search", search);
  if (type) apiUrl.searchParams.append("type", type);
  if (category_id) apiUrl.searchParams.append("category_id", category_id);

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
        { error: errorData.message || "Failed to fetch inventory data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Inventory data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
