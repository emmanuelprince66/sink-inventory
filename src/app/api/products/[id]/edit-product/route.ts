import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params; // Await the params promise
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

    const formData = await request.formData();
    const apiUrl = `${BaseUrl}product/single_product/${productId}/`;

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
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
