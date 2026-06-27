import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Proxies GET /order/shipping_dimention/ — list of box-size presets the
// Shipbubble setup modal renders for the merchant to pick from.
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${BaseUrl}order/shipping_dimention/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch box sizes",
          error: data.error || null,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Box sizes fetched successfully" },
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
