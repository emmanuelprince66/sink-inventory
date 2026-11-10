import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
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

  // Validate businessId
  if (!businessId) {
    return NextResponse.json(
      {
        success: false,
        error: "Business ID is required",
        message: "No business identifier provided",
      },
      { status: 400 }
    );
  }

  try {
    const requestData = await request.json();
    console.log("Received data:", requestData);

    // Extract payload from the request data
    const payload = requestData.apiPayload;

    console.log("Payload:----444", payload);

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
    //       message: "Customer name is required",
    //       details: { missing_fields: ["name"] },
    //     },
    //     { status: 422 }
    //   );
    // }

    const apiUrl = `${BaseUrl}sale/${businessId}/`;
    console.log("Forwarding to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    // A gateway (nginx, load balancer) answers with an HTML page when the API
    // behind it is down. That's "unreachable", not a sale the API refused.
    const responseData = await response.json().catch(() => null);
    if (responseData === null) {
      console.error("Backend sent no JSON:", response.status);
      return NextResponse.json(
        {
          success: false,
          unreachable: true,
          message: "The server couldn't be reached.",
          error: "Bad gateway",
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error("Backend API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Transaction failed",
          error: responseData.error || "Transaction failed",
          details: responseData.details || null,
          // Permission refusals, so the till can ask for a manager's PIN.
          code: responseData.code,
          module: responseData.module,
          action: responseData.action,
        },
        { status: response.status }
      );
    }

    // Successful response
    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Transaction created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    // The API couldn't be reached at all.
    console.error("Server error:", error);
    return NextResponse.json(
      {
        success: false,
        unreachable: true,
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
