// app/api/(business)/businesses/store-themes/route.ts
import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  const search = request.nextUrl.searchParams.get("search") || "";
  const page = request.nextUrl.searchParams.get("page") || "";
  const limit = request.nextUrl.searchParams.get("limit") || "";

  const apiUrl = new URL(`${BaseUrl}business/store_themes/`);
  if (search) apiUrl.searchParams.append("search", search);
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
        { error: errorData.message || "Failed to fetch store themes" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Store themes fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching store themes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
