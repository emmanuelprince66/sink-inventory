import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Read, update and delete a single segment. `segmentId` is the segment's own
// uuid — not the business id used by the list route.

const authorize = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
};

const unauthorized = () =>
  NextResponse.json(
    { success: false, error: "Unauthorized - No access token provided" },
    { status: 401 }
  );

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
) {
  const { segmentId } = await params;
  const accessToken = await authorize();
  if (!accessToken) return unauthorized();

  try {
    const response = await fetch(
      `${BaseUrl}customer/segment/single/${segmentId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to fetch segment",
          message: data.message || "Failed to fetch segment",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Segment fetched successfully",
    });
  } catch (error) {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
) {
  const { segmentId } = await params;
  const accessToken = await authorize();
  if (!accessToken) return unauthorized();

  try {
    const payload = await request.json();

    const response = await fetch(
      `${BaseUrl}customer/segment/single/${segmentId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to update segment",
          message: data.message || "Failed to update segment",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Segment updated successfully",
    });
  } catch (error) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
) {
  const { segmentId } = await params;
  const accessToken = await authorize();
  if (!accessToken) return unauthorized();

  try {
    const response = await fetch(
      `${BaseUrl}customer/segment/single/${segmentId}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    // 204 carries no body — reading json() would throw.
    if (response.status === 204 || response.ok) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "Segment deleted successfully",
      });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(
      {
        success: false,
        error: data.error || "Failed to delete segment",
        message: data.message || "Failed to delete segment",
      },
      { status: response.status }
    );
  } catch (error) {
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
