import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: comboId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  if (!comboId) {
    return NextResponse.json(
      { error: "Combo ID is required" },
      { status: 400 },
    );
  }

  try {
    const incoming = await request.formData();
    const image = incoming.get("image");
    const hasImage = image instanceof File && image.size > 0;

    let items: any[] = [];
    try {
      items = JSON.parse(String(incoming.get("items") || "[]"));
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid items payload" },
        { status: 400 },
      );
    }

    const name = String(incoming.get("name") || "");
    const description = incoming.get("description");
    const sellOnline =
      String(incoming.get("sell_online") || "false") === "true";

    const jsonBody: Record<string, any> = {
      name,
      sell_online: sellOnline,
      items,
    };
    if (description) jsonBody.description = String(description);

    const apiUrl = `${BaseUrl}combo/single/${comboId}/`;

    // Step 1: Update combo data as JSON
    const updateResponse = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonBody),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to update combo",
          error: errorData.error || errorData,
        },
        { status: updateResponse.status },
      );
    }

    let updatedCombo = await updateResponse.json();

    // Step 2: Upload image if provided
    if (hasImage) {
      const imageForm = new FormData();
      imageForm.append("image", image as File);

      const imagePatchResponse = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: imageForm,
      });

      if (imagePatchResponse.ok) {
        updatedCombo = await imagePatchResponse.json();
      } else {
        console.error(
          "Combo updated but image upload failed:",
          await imagePatchResponse.text(),
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedCombo,
        message: "Combo updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
