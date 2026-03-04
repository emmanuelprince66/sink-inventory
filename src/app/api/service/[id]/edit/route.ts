import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  console.log("PATCH /api/service/[id]/edit called");

  try {
    const { id: productId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Please authenticate first",
        },
        { status: 401 },
      );
    }

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
          message: "No product identifier provided",
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();

    // Debug log — safe to keep in dev
    const formDataEntries: Record<string, any> = {};
    for (const [key, value] of Array.from(formData.entries())) {
      formDataEntries[key] =
        value instanceof File
          ? `File: ${value.name} (${value.size} bytes)`
          : value;
    }
    console.log("PATCH form data received:", formDataEntries);

    const apiUrl = `${BaseUrl}service/single_service/${productId}/`;

    // FIX: Forward FormData directly — no JSON.stringify, no Content-Type header
    // Let fetch set the correct multipart/form-data boundary automatically
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        // DO NOT set Content-Type here — fetch sets it automatically with the correct boundary
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to edit Service",
          error: responseData.error || "Service edit failed",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Service updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
