import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

  try {
    // Get FormData from request
    const formData = await request.formData();

    // Extract business_id
    const business_id = formData.get("business_id") as string;

    console.log("business_id", business_id);

    // Validate businessId
    if (!business_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Business ID is required",
          message: "No Business identifier provided",
        },
        { status: 400 }
      );
    }

    console.log("Updating business:", business_id);
    console.log("FormData entries:", Array.from(formData.entries()));

    const apiUrl = `${BaseUrl}business/${business_id}/`;
    console.log("Forwarding to:", apiUrl);

    // Forward the FormData directly to the backend
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let fetch set it with boundary for FormData
      },
      body: formData,
      cache: "no-store",
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Backend API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to update Business",
          error: responseData.error || "Business update failed",
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
        message: "Business updated successfully",
      },
      { status: 200 }
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
