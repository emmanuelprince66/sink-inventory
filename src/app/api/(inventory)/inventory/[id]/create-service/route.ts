import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  if (!businessId) {
    return NextResponse.json(
      { error: "Business ID is required" },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();

    // Convert FormData to array first for safe iteration
    const formDataEntries: Record<string, any> = {};
    const entriesArray = Array.from(formData.entries());
    for (const [key, value] of entriesArray) {
      formDataEntries[key] = value instanceof File ? value.name : value;
    }
    console.log("Form data received:", formDataEntries);

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${accessToken}`);

    console.log("formData---33", formData);

    const apiUrl = `${BaseUrl}service/business/${businessId}/`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to create product" },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(
      { success: true, data: responseData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
