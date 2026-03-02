// app/api/presale/[id]/fetch/route.ts
import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Presale code is required" },
      { status: 400 },
    );
  }

  const apiUrl = new URL(`${BaseUrl}sale/fetch_presale/${id}/`);
  apiUrl.searchParams.set("code", code);

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch presale data" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Presale data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching presale data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
