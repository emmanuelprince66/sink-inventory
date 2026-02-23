import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface QueryParams {
  search?: string;
  type?: string;
  category_id?: string;
  department_id?: string;
  page?: string;
  limit?: string;
  allow_tax?: boolean;
  sell_online?: boolean;
  in_house?: boolean;
  raw_material?: boolean;
  watchlist?: boolean;
}

const parseBool = (val: string | null): boolean | undefined => {
  if (val === "true") return true;
  if (val === "false") return false;
  return undefined;
};

export async function GET(
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

  const searchParams = request.nextUrl.searchParams;

  const pageStr = searchParams.get("page");
  const limitStr = searchParams.get("limit");
  const page = pageStr ? parseInt(pageStr) : 1;
  const limit = limitStr ? parseInt(limitStr) : 20;

  if (isNaN(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page number" }, { status: 400 });
  }
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: "Limit must be between 1 and 100" },
      { status: 400 },
    );
  }

  const query: QueryParams = {
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    category_id: searchParams.get("category_id") || "",
    department_id: searchParams.get("department_id") || "",
    page: page.toString(),
    limit: limit.toString(),
  };

  // Parse boolean filters — only add to query if explicitly provided
  const booleanFields = [
    "allow_tax",
    "sell_online",
    "in_house",
    "raw_material",
    "watchlist",
  ] as const;

  booleanFields.forEach((key) => {
    const parsed = parseBool(searchParams.get(key));
    if (parsed !== undefined) {
      (query as any)[key] = parsed;
    }
  });

  const apiUrl = new URL(`${BaseUrl}product/business/${id}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Booleans must be appended as "true"/"false" strings in the URL
      // but their TYPE in our query object is boolean — the API receives proper boolean query params
      apiUrl.searchParams.append(key, String(value));
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
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "Failed to fetch inventory data" };
      }
      return NextResponse.json(
        {
          error: errorData.message || "Failed to fetch inventory data",
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Inventory data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
