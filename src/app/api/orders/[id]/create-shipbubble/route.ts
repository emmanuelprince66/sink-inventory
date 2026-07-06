import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Proxies POST /order/business/create_order_shipbubble/{reference}/ — used
// when the business has an active Shipbubble integration. `id` here is the
// shipment `reference` returned by fetch_shipment_rate.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: reference } = await params;
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
      `${BaseUrl}order/business/create_order_shipbubble/${reference}/`,
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
          message: data.message || "Failed to create order",
          error: data.error || null,
          details: data.details || null,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Order created successfully" },
      { status: 201 },
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
