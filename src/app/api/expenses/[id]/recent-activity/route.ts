import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", message: "Please authenticate first" },
      { status: 401 }
    );
  }

  const apiUrl = new URL(`${BaseUrl}expenses/business/${id}/recent-activity/`);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (value) apiUrl.searchParams.append(key, value);
  });

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    const rawBody = await response.text();
    let responseData: any = null;
    try {
      responseData = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      console.error("Non-JSON response fetching recent activity:", response.status, rawBody.slice(0, 2000));
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData?.message || responseData?.error || "Failed to fetch recent activity",
          error: responseData?.error || "Failed to fetch recent activity",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Recent activity fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching expense recent activity:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
