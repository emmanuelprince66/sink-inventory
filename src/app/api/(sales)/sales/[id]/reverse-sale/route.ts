import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}sale/reverse/`);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      // First check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.message || "Failed to reverse sale" },
          { status: response.status }
        );
      } else {
        // Handle non-JSON responses (like HTML error pages)
        const text = await response.text();
        return NextResponse.json(
          { error: `Request failed with status ${response.status}` },
          { status: response.status }
        );
      }
    }

    // Handle 204 No Content response
    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        message: "Sale reversed successfully",
      });
    }

    // For other successful responses with content
    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Sale reversed successfully",
    });
  } catch (error) {
    console.error("Error reversing sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
