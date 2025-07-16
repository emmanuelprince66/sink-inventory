// app/api/(customer)/customer/[id]/route.ts
import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Await the params promise

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  const search = request.nextUrl.searchParams.get("search") || "";
  const start_date = request.nextUrl.searchParams.get("start_date") || "";
  const end_date = request.nextUrl.searchParams.get("end_date") || "";
  const page = request.nextUrl.searchParams.get("page") || "1"; // Get page
  const limit = request.nextUrl.searchParams.get("limit") || "30"; // Get limit

  console.log("page", page);
  console.log("limit", limit);

  // console.log("category", category);

  // Build the API URL
  const apiUrl = new URL(`${BaseUrl}bank/`);
  if (search) apiUrl.searchParams.append("search", search);
  if (start_date) apiUrl.searchParams.append("start_date", start_date);
  if (end_date) apiUrl.searchParams.append("end_date", end_date);
  if (page) apiUrl.searchParams.append("page", page); // Append page
  if (limit) apiUrl.searchParams.append("limit", limit); // Append limit

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
        { error: errorData.message || "Failed to fetch expenses data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Transactions data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching transaction  data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
