// app/api/sales/[id]/report/route.ts
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

  // Extract all query parameters
  const start_date = request.nextUrl.searchParams.get("start_date") || "";
  const end_date = request.nextUrl.searchParams.get("end_date") || "";
  const exportFormat = request.nextUrl.searchParams.get("export") || "";
  const type = request.nextUrl.searchParams.get("type") || "order_history";
  const attendant_id = request.nextUrl.searchParams.get("attendant_id") || "";
  const payment_status =
    request.nextUrl.searchParams.get("payment_status") || "";
  const status = request.nextUrl.searchParams.get("status") || "";
  const search = request.nextUrl.searchParams.get("search") || "";
  const fast_moving = request.nextUrl.searchParams.get("fast_moving") || "";
  const most_profitable =
    request.nextUrl.searchParams.get("most_profitable") || "";
  const top_selling = request.nextUrl.searchParams.get("top_selling") || "";
  const discounted = request.nextUrl.searchParams.get("discounted") || "";

  // Build the API URL
  const apiUrl = new URL(`${BaseUrl}report/${id}/sales/`);
  if (start_date) apiUrl.searchParams.append("start_date", start_date);
  if (end_date) apiUrl.searchParams.append("end_date", end_date);
  if (exportFormat) apiUrl.searchParams.append("export", exportFormat);
  if (type) apiUrl.searchParams.append("type", type);
  if (attendant_id) apiUrl.searchParams.append("attendant_id", attendant_id);
  if (payment_status)
    apiUrl.searchParams.append("payment_status", payment_status);
  if (status) apiUrl.searchParams.append("status", status);
  if (search) apiUrl.searchParams.append("search", search);
  if (fast_moving) apiUrl.searchParams.append("fast_moving", fast_moving);
  if (most_profitable)
    apiUrl.searchParams.append("most_profitable", most_profitable);
  if (top_selling) apiUrl.searchParams.append("top_selling", top_selling);
  if (discounted) apiUrl.searchParams.append("discounted", discounted);

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
          error: errorData.message || "Failed to fetch sales report data",
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
        `attachment; filename="sales-report.${
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
      message: "Sales report data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching sales report data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
