import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["sales", "expenses", "inventory", "analytics"] as const;
const ALLOWED_TIMEFRAMES = [
  "today",
  "last_7_days",
  "last_1_month",
  "last_3_months",
  "custom",
] as const;
const ALLOWED_FORMATS = ["json", "csv", "xlsx"] as const;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const business_id = searchParams.get("business_id") || "";
  const report_type = searchParams.get("report_type") || "";
  const timeframe = searchParams.get("timeframe") || "custom";
  const start_date = searchParams.get("start_date") || "";
  const end_date = searchParams.get("end_date") || "";
  const export_format = searchParams.get("export_format") || "xlsx";

  if (!business_id) {
    return NextResponse.json(
      { error: "business_id is required" },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.includes(report_type as any)) {
    return NextResponse.json(
      { error: `report_type must be one of: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!ALLOWED_TIMEFRAMES.includes(timeframe as any)) {
    return NextResponse.json(
      { error: `timeframe must be one of: ${ALLOWED_TIMEFRAMES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!ALLOWED_FORMATS.includes(export_format as any)) {
    return NextResponse.json(
      {
        error: `export_format must be one of: ${ALLOWED_FORMATS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const apiUrl = new URL(`${BaseUrl}report/generate/`);
  apiUrl.searchParams.append("business_id", business_id);
  apiUrl.searchParams.append("report_type", report_type);
  apiUrl.searchParams.append("timeframe", timeframe);
  if (timeframe === "custom") {
    if (start_date) apiUrl.searchParams.append("start_date", start_date);
    if (end_date) apiUrl.searchParams.append("end_date", end_date);
  }
  apiUrl.searchParams.append("export_format", export_format);

  try {
    // Report generation now runs as a background task — this call just
    // kicks it off and returns 202 + a task_id to poll via
    // /api/report/status/[taskId], instead of streaming the file directly.
    const upstream = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const body = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { error: body.message || body.detail || "Failed to start report generation" },
        { status: upstream.status },
      );
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    console.error("Error starting report generation:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
