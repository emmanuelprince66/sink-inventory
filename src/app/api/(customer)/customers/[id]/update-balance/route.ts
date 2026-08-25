import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BaseUrl } from "@/constants/base-url";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: walletId } = await params;
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

  // Validate walletId
  if (!walletId) {
    return NextResponse.json(
      {
        success: false,
        error: "Wallet ID is required",
        message: "No wallet identifier provided",
      },
      { status: 400 }
    );
  }

  try {
    const requestData = await request.json();
    console.log("Received data:", requestData);

    // Extract payload from the request data
    const payload = requestData;

    console.log("payload---r", payload);

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
    if (!payload.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          message: "amount is required",
          details: { missing_fields: ["amount"] },
        },
        { status: 422 }
      );
    }

    // POST /customer/fund/{id}/ types `amount` as an integer. The spread has
    // to come first: with it last it put the form's string back over the
    // coerced number, and the API rejected the body.
    const insert = {
      ...payload,
      amount: Number(payload.amount),
    };

    const apiUrl = `${BaseUrl}customer/fund/${walletId}/`;
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
          message: responseData.message || "Failed to update wallet balance",
          error: responseData.error || "Wallet  update failed",
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
        message: "Wallet updated  successfully",
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
