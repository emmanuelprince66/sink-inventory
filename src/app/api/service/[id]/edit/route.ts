import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("PATCH /api/service/[id]/edit called");
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
    const apiUrl = `${BaseUrl}service/single_service/${productId}/`;

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to edit Service",
          error: responseData.error || "Service edit failed",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Service updated successfully",
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
