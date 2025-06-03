// app/api/(customer)/customer/[id]/route.ts
import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Type for query parameters
interface QueryParams {
  search?: string;
  page?: string;
  limit?: string;
}

export async function GET(request: NextRequest) {
  // Await the params promise

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  // Extract all query parameters
  const searchParams = request.nextUrl.searchParams;
  const query: QueryParams = {
    search: searchParams.get("search") || "",
    page: searchParams.get("page") || "1", // Default to page 1
    limit: searchParams.get("limit") || "15", // Default to 15 items
  };

  const pageStr = searchParams.get("page");
  const limitStr = searchParams.get("limit");

  const page = pageStr ? parseInt(pageStr) : 1;
  const limit = limitStr ? parseInt(limitStr) : 15;

  if (isNaN(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: "Limit must be between 1 and 100" },
      { status: 400 }
    );
  }

  // Build the API URL
  const apiUrl = new URL(`${BaseUrl}user/plans/`);

  // Add all valid query parameters
  Object.entries(query).forEach(([key, value]) => {
    if (value && value !== "") {
      apiUrl.searchParams.append(key, value);
    }
  });

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
      // Try to get error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "Failed to fetch user plan data" };
      }

      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch user plan data",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
      message: "user plan data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user plan data:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
