import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: businessId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  if (!businessId) {
    return NextResponse.json(
      { error: "Business ID is required" },
      { status: 400 },
    );
  }

  try {
    const incoming = await request.formData();
    const image = incoming.get("image");
    const hasImage = image instanceof File && image.size > 0;

    // Parse items JSON string
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

    // Step 1: Create combo as JSON body (DRF parses nested items natively)
    const jsonBody: Record<string, any> = {
      name,
      sell_online: sellOnline,
      items,
    };
    if (description) jsonBody.description = String(description);

    const apiUrl = `${BaseUrl}combo/${businessId}/`;
    const createResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonBody),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to create combo",
          error: errorData.error || errorData,
        },
        { status: createResponse.status },
      );
    }

    let createdCombo = await createResponse.json();

    // Step 2: Upload image via PATCH if provided
    if (hasImage && createdCombo?.id) {
      const imageForm = new FormData();
      imageForm.append("image", image as File);

      const patchResponse = await fetch(
        `${BaseUrl}combo/single/${createdCombo.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: imageForm,
        },
      );

      if (patchResponse.ok) {
        createdCombo = await patchResponse.json();
      } else {
        console.error(
          "Combo created but image upload failed:",
          await patchResponse.text(),
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: createdCombo,
        message: "Combo created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
