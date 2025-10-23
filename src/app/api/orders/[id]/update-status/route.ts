import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Authentication check
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized - No access token provided",
        message: "Please authenticate first",
      },
      { status: 401 }
    );
  }

  // Validate orderId
  if (!orderId) {
    return NextResponse.json(
      {
        success: false,
        error: "Order ID is required",
        message: "No Order identifier provided",
      },
      { status: 400 }
    );
  }

  try {
    const requestData = await request.json();
    console.log("Received data:", requestData);

    // Extract payload from the request data
    const payload = requestData;

    console.log("payload---r", payload);

    // Validate payload structure
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          message: "Payload must be an object",
          details: { received: payload },
        },
        { status: 400 }
      );
    }

    const apiUrl = `${BaseUrl}order/change_shipping/${orderId}/?status=${payload.status}`;
    console.log("Forwarding to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    console.log("Response status:", response);

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to update Order status ",
          error: responseData.error || "Attendant  update failed",
          details: responseData.details || null,
        },
        { status: response.status }
      );
    }

    // Successful response
    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Order updated  successfully",
      },
      { status: 201 }
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
      { status: 500 }
    );
  }
}
