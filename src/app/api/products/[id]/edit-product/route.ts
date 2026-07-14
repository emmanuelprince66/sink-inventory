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
    console.log("formData entries:", Object.fromEntries(formData.entries()));

    console.log("formData", formData);

    const apiUrl = `${BaseUrl}product/single_product/${productId}/`;

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    // The backend doesn't always return JSON on error (e.g. an unhandled
    // 500 can come back as an HTML traceback page or plain text). Read as
    // text first and only parse as JSON if it looks like JSON, so a
    // non-JSON error body doesn't get swallowed into a generic 500 by the
    // catch block below — we want the real backend status/message to reach
    // the client.
    const rawBody = await response.text();
    let responseData: any = null;
    try {
      responseData = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      console.error(
        "Non-JSON response from backend on product edit:",
        response.status,
        rawBody.slice(0, 2000),
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            responseData?.message ||
            responseData?.error ||
            (rawBody ? rawBody.slice(0, 500) : "Failed to edit product"),
          error: responseData?.error || "Product edit failed",
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
