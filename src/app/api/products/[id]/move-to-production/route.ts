import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: productId } = await params;
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
      { status: 401 },
    );
  }

  // Validate productId
  if (!productId) {
    return NextResponse.json(
      {
        success: false,
        error: "Business ID is required",
        message: "No business identifier provided",
      },
      { status: 400 },
    );
  }

  try {
    const requestData = await request.json();
    console.log("Received data:", requestData);

    // Extract payload from the request data
    const payload = requestData.payload;

    // Validate payload structure
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          message: "Payload must be an object",
          details: { received: payload },
        },
        { status: 400 },
      );
    }

    const insert = {
      quantity: payload.quantity,
      note: payload.note,
    };

    // Validate required fields
    // if (!payload.name) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Validation error",
    //       message: "Customer name is required",
    //       details: { missing_fields: ["name"] },
    //     },
    //     { status: 422 },
    //   );
    // }

    const apiUrl = `${BaseUrl}product/move_to_production/${productId}/`;
    console.log("Forwarding to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(insert),
      cache: "no-store",
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Backend API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          message:
            responseData.message || "Failed to move product to production",
          error: responseData.error || "Move product to production  failed",
          details: responseData.details || null,
        },
        { status: response.status },
      );
    }

    // Successful response
    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Product moved to production  successfully",
      },
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
