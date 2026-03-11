// app/api/category/[id]/delete/route.ts
import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Await the params promise
  const { id } = await params;

  console.log("Deleting category with id:", id);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  const apiUrl = new URL(`${BaseUrl}category/${id}/`);

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    console.log("Delete category response:", response);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to delete category" },
        { status: response.status },
      );
    }

    // For DELETE, the response might be empty, so we don't always expect JSON
    let data;
    try {
      data = await response.json();
      console.log("Delete category data:", data);
    } catch (e) {
      console.error("Error parsing response:", e);
      data = null;
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
