import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Proxies POST /order/fetch_shipment_rate/{business_id}/ — returns live
// Shipbubble courier rates + the request_token/reference needed to finalize
// the order via create_order_shipbubble.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: businessId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  try {
    const payload = await request.json();

    const response = await fetch(
      `${BaseUrl}order/fetch_shipment_rate/${businessId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch delivery rates",
          error: data.error || null,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Delivery rates fetched successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
