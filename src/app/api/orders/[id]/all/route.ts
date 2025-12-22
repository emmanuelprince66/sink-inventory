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

  // Extract query parameters
  const search = request.nextUrl.searchParams.get("search") || "";
  const page = request.nextUrl.searchParams.get("page") || "1";
  const limit = request.nextUrl.searchParams.get("limit") || "30";
  const order_type = request.nextUrl.searchParams.get("order_type") || "";
  const shipping_status =
    request.nextUrl.searchParams.get("shipping_status") || "";
  const payment_status =
    request.nextUrl.searchParams.get("payment_status") || "";
  const start_date = request.nextUrl.searchParams.get("start_date") || "";
  const end_date = request.nextUrl.searchParams.get("end_date") || "";

  // console.log("Query Params:", {
  //   search,
  //   page,
  //   limit,
  //   order_type,
  //   shipping_status,
  //   payment_status,
  // });

  // Build the API URL
  const apiUrl = new URL(`${BaseUrl}order/orders/${id}/all`);

  // Append parameters only if they have values
  if (search) apiUrl.searchParams.append("search", search);
  if (page) apiUrl.searchParams.append("page", page);
  if (limit) apiUrl.searchParams.append("limit", limit);
  if (order_type) apiUrl.searchParams.append("order_type", order_type);
  if (shipping_status)
    apiUrl.searchParams.append("shipping_status", shipping_status);
  if (payment_status)
    apiUrl.searchParams.append("payment_status", payment_status);
  // if (start_date) apiUrl.searchParams.append("start_date", start_date);
  // if (end_date) apiUrl.searchParams.append("end_date", end_date);

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
        { error: errorData.message || "Failed to fetch orders data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Orders data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching orders data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
