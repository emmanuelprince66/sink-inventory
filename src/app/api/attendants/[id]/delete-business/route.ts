import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  const apiUrl = new URL(`${BaseUrl}business/single_attendant/business/${id}/`);

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
      const errorData = await response.json();
      return NextResponse.json(
        {
          error:
            errorData.message || "Failed to remove attendant from business",
        },
        { status: response.status },
      );
    }

    // DELETE may return empty body
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing response:", e);
      data = null;
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Attendant removed from business successfully",
    });
  } catch (error) {
    console.error("Error removing attendant from business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
