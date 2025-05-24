import { BaseUrl } from "@/constants/base-url";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Request received at /api/auth/reset-invite-password");
  //   const cookieStore = await cookies();
  //   const accessToken = cookieStore.get("accessToken")?.value;

  //   // Authentication check
  //   if (!accessToken) {
  //     return NextResponse.json(
  //       {
  //         success: false,
  //         error: "Unauthorized - No access token provided",
  //         message: "Please authenticate first",
  //       },
  //       { status: 401 }
  //     );
  //   }

  // Validate businessId

  try {
    const requestData = await request.json();
    console.log("Received data:", requestData);

    // Extract payload from the request data
    const payload = requestData;

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

    // Validate required fields

    const apiUrl = `${BaseUrl}auth/invite_change_password/`;
    console.log("Forwarding to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    console.log("Response status:", response);

    const responseData = await response.json();
    console.log("Response from backend:", responseData);

    if (!response.ok) {
      console.error("Backend API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to change password",
          error: responseData.error || "Reset password failed",
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
        message: "Password changed successfully",
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
