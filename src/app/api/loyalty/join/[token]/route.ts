import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { success: false, error: "token is required" },
      { status: 400 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}loyalty/join/${token}/`);

  try {
    const payload = await request.json();

    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to create loyalty programme",
          message: data.message || "Failed to create loyalty programme",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Loyalty programme joined successfully",
    });
  } catch (error) {
    console.error("Error handling loyalty programme:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * Public campaign lookup for the landing page — no auth, by design: a customer
 * scanning a QR has no session. Deliberately does not forward the caller's
 * cookies for the same reason.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "token is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${BaseUrl}loyalty/join/${token}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.error || "Could not load this campaign",
          // 404 = invalid/expired QR, 400 = programme not active. Both are
          // meaningful to the customer, so the message is passed through.
          message: data?.message || data?.detail || "Could not load this campaign",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Campaign fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching public campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
