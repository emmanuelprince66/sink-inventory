import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  if (!programId) {
    return NextResponse.json(
      { success: false, error: "programId is required" },
      { status: 400 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}loyalty/programs/single/${programId}/`);

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to fetch loyalty program detail",
          message: data.message || "Failed to fetch loyalty program detail",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Loyalty program detail fetched successfully",
    });
  } catch (error) {
    console.error("Error handling loyalty program detail:", error);
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
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  if (!programId) {
    return NextResponse.json(
      { success: false, error: "programId is required" },
      { status: 400 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}loyalty/programs/single/${programId}/`);

  try {
    const payload = await request.json();

    const response = await fetch(apiUrl.toString(), {
      method: "PATCH",
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
          error: data.error || "Failed to update loyalty program",
          message: data.message || "Failed to update loyalty program",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Loyalty program updated successfully",
    });
  } catch (error) {
    console.error("Error handling loyalty program:", error);
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
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  if (!programId) {
    return NextResponse.json(
      { success: false, error: "programId is required" },
      { status: 400 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}loyalty/programs/single/${programId}/`);

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || "Failed to delete loyalty program",
          message: errorData.message || "Failed to delete loyalty program",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: "Loyalty program deleted successfully",
    });
  } catch (error) {
    console.error("Error handling loyalty program:", error);
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
