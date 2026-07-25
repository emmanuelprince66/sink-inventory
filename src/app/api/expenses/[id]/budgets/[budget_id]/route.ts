import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; budget_id: string }> }
) {
  const { id, budget_id: budgetId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", message: "Please authenticate first" },
      { status: 401 }
    );
  }

  const apiUrl = `${BaseUrl}expenses/business/${id}/budgets/${budgetId}/`;

  try {
    const payload = await request.json();

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const rawBody = await response.text();
    let responseData: any = null;
    try {
      responseData = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      console.error("Non-JSON response editing budget:", response.status, rawBody.slice(0, 2000));
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData?.message || responseData?.error || "Failed to update budget",
          error: responseData?.error || "Failed to update budget",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Budget updated successfully",
    });
  } catch (error) {
    console.error("Error editing budget:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; budget_id: string }> }
) {
  const { id, budget_id: budgetId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", message: "Please authenticate first" },
      { status: 401 }
    );
  }

  const apiUrl = `${BaseUrl}expenses/business/${id}/budgets/${budgetId}/`;

  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const rawBody = await response.text();
      let responseData: any = null;
      try {
        responseData = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        console.error("Non-JSON response deleting budget:", response.status, rawBody.slice(0, 2000));
      }
      return NextResponse.json(
        {
          success: false,
          message: responseData?.message || responseData?.error || "Failed to remove budget",
          error: responseData?.error || "Failed to remove budget",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Budget removed successfully",
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
