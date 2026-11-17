// app/api/businesses/route.ts
import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Get the access token from cookies
  const cookieStore = await cookies(); // Add 'await' here
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  try {
    // A branch other than the founding one has its own plan and usage; the
    // backend answers for the founding branch when this is left out.
    const businessId = new URL(request.url).searchParams.get("business_id");
    const apiUrl = new URL(`${BaseUrl}user/active_plan/`);
    if (businessId) apiUrl.searchParams.set("business_id", businessId);

    const response = await fetch(apiUrl.toString(), {
      cache: "no-store",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("respo--44", response);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
