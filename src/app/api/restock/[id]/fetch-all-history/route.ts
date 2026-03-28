import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token provided" },
        { status: 401 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const start_date = searchParams.get("start_date") || "";
    const end_date = searchParams.get("end_date") || "";
    const user = searchParams.get("user") || "";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Build external API URL
    const apiUrl = new URL(`${BaseUrl}product/restock_history/${id}/`);

    // Add query parameters to external API
    if (search) apiUrl.searchParams.append("search", search);
    if (start_date) apiUrl.searchParams.append("start_date", start_date);
    if (end_date) apiUrl.searchParams.append("end_date", end_date);
    if (user) apiUrl.searchParams.append("user", user);
    apiUrl.searchParams.append("page", page);
    apiUrl.searchParams.append("limit", limit);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch restock history" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching restock history:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
