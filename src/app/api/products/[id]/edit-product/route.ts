import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { [key: string]: string | string[] } }
) {
  // Extract the id from params - it could be string or string[]
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Authentication check
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
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
    // Get FormData from request
    const formData = await request.formData();
    console.log("Received FormData entries:");

    // Log all FormData entries for debugging
    const formDataEntries = Array.from(formData.entries());
    for (const [key, value] of formDataEntries) {
      console.log(key, value);
    }

    const apiUrl = `${BaseUrl}product/single_product/${productId}/`;

    // Forward FormData directly to your API
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData, // Send FormData directly
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Backend API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to edit product",
          error: responseData.error || "Product edit failed",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Product updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
