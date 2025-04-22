// app/api/(customer)/customer/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BaseUrl } from "@/constants/base-url";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get the access token from cookies
  const cookieStore = await cookies(); // cookies() is synchronous
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  const id = params.id;
  const search = req.nextUrl.searchParams.get("search") || "";
  const status = req.nextUrl.searchParams.get("status") || "";

  console.log("URL:", req.url);
  console.log("ID:", id);
  console.log("Search:", search);
  console.log("Status:", status);

  // Build the API URL
  const apiUrl = new URL(`${BaseUrl}customer/${params.id}/`);
  // Add query parameters if they exist
  if (search) apiUrl.searchParams.append("search", search);
  if (status) apiUrl.searchParams.append("status", status);

  try {
    // Make the API request
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // If the API response is not OK, forward the error
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch customer data" },
        { status: response.status }
      );
    }

    // Parse the successful response
    const data = await response.json();

    // Return the data to the frontend
    return NextResponse.json({
      success: true,
      data,
      message: "Customer data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
