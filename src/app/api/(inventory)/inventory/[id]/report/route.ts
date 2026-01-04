// app/api/inventory/[id]/report/route.ts
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
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  const exportFormat = request.nextUrl.searchParams.get("export") || "";

  // Build the API URL - no date parameters needed for inventory
  const apiUrl = new URL(`${BaseUrl}report/${id}/inventory/`);
  if (exportFormat) apiUrl.searchParams.append("export", exportFormat);

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
        {
          error: errorData.message || "Failed to fetch inventory report data",
        },
        { status: response.status }
      );
    }

    // If export format is specified, return the file directly
    if (exportFormat === "csv" || exportFormat === "excel") {
      const fileBuffer = await response.arrayBuffer();
      const contentType =
        exportFormat === "csv"
          ? "text/csv"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const contentDisposition =
        response.headers.get("Content-Disposition") ||
        `attachment; filename="inventory-report.${
          exportFormat === "csv" ? "csv" : "xlsx"
        }"`;

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
        },
      });
    }

    // Otherwise return JSON data
    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Inventory report data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching inventory report data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
