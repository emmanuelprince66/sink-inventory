import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Proxies a JSON PATCH /business/{id}/ specifically for the shipbubble +
// shipping_companies fields. DRF can't deserialize a JSON-stringified nested
// object passed inside a multipart FormData field, so we send a real
// application/json body here instead of going through update-business.
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized - No access token provided",
        message: "Please authenticate first",
      },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const business_id: string | undefined = body?.business_id;

    if (!business_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Business ID is required",
          message: "No Business identifier provided",
        },
        { status: 400 },
      );
    }

    // Only forward the fields we own — never echo arbitrary client keys.
    // The write field is `shipbubble_settings` per swagger; the response
    // exposes it back under `shipbubble`.
    const forwarded: Record<string, unknown> = {};
    if (body.shipbubble_settings !== undefined) {
      forwarded.shipbubble_settings = body.shipbubble_settings;
    }
    if (Array.isArray(body.shipping_companies)) {
      forwarded.shipping_companies = body.shipping_companies;
    }

    const apiUrl = `${BaseUrl}business/${business_id}/`;
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forwarded),
      cache: "no-store",
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Backend API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to update Shipbubble",
          error: responseData.error || "Shipbubble update failed",
          details: responseData.details || responseData,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Shipbubble settings updated successfully",
      },
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
