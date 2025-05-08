import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      { status: 401 }
    );
  }

  // Validate productId
  if (!productId) {
    return NextResponse.json(
      {
        success: false,
        error: "Product ID is required",
        message: "No product identifier provided",
      },
      { status: 400 }
    );
  }

  try {
    const requestData = await request.json();
    console.log("Received data:", requestData);

    // Extract payload from the request data
    const payload = requestData.payload;

    console.log("payload", payload);

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

    // // Validate required fields
    // if (!payload.name) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Validation error",
    //       message: "Product name is required",
    //       details: { missing_fields: ["name"] },
    //     },
    //     { status: 422 }
    //   );
    // }

    const apiUrl = `${BaseUrl}product/single_product/${productId}/`;
    console.log("Forwarding to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Backend API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to edit product",
          error: responseData.error || "Product edit failed",
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
        message: "Product updated successfully",
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
