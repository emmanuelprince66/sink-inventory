// app/api/(customer)/customer/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BaseUrl } from "@/constants/base-url";

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
  const status = request.nextUrl.searchParams.get("status") || "";

  // Build the API URL
  const apiUrl = new URL(`${BaseUrl}customer/${id}/`);
  if (search) apiUrl.searchParams.append("search", search);
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

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch customer data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Customer data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
