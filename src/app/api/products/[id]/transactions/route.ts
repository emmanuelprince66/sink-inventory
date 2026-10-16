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

  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "10";
  const variantId = request.nextUrl.searchParams.get("variant_id");
  const type = request.nextUrl.searchParams.get("type");
  const startDate = request.nextUrl.searchParams.get("start_date");
  const endDate = request.nextUrl.searchParams.get("end_date");

  const apiUrl = new URL(`${BaseUrl}product/transaction/${id}/`);

  apiUrl.searchParams.append("page", page);
  apiUrl.searchParams.append("limit", limit);
  if (variantId) apiUrl.searchParams.append("variant_id", variantId);
  if (type) apiUrl.searchParams.append("type", type);
  if (startDate) apiUrl.searchParams.append("start_date", startDate);
  if (endDate) apiUrl.searchParams.append("end_date", endDate);

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
          error:
            errorData.message || "Failed to fetch Transactions Product data",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Transactions Product data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching Transactions product data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
