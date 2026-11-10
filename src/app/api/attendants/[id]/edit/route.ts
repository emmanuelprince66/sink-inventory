import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attendantId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Authentication check
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized - No access token provided",
        message: "Please authenticate first",
      },
      { status: 401 }
    );
  }

  // Validate attendantId
  if (!attendantId) {
    return NextResponse.json(
      {
        success: false,
        error: "Attendant ID is required",
        message: "No attendant identifier provided",
      },
      { status: 400 }
    );
  }

  try {
    const requestData = await request.json();
    console.log("Received data:", requestData);

    // Not for the backend: says to leave saved permissions alone.
    const { keep_saved_permissions: keepSavedPermissions, ...payload } =
      requestData ?? {};

    console.log("payload---r", payload);

    // Validate payload structure
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          message: "Payload must be an object",
          details: { received: payload },
        },
        { status: 400 }
      );
    }

    const apiUrl = `${BaseUrl}business/single_attendant/${attendantId}/`;
    console.log("Forwarding to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    console.log("Response status:", response);

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to update Attendant ",
          error: responseData.error || "Attendant  update failed",
          details: responseData.details || null,
        },
        { status: response.status }
      );
    }

    // Name and phone save on single_attendant; role and permissions only stick
    // through edit_attendant. Leaving set_permissions out re-applies the
    // role's defaults, which is how Reset works.
    if (keepSavedPermissions && !payload.set_permissions) {
      return NextResponse.json(
        {
          success: true,
          data: responseData,
          message: "Attendant updated successfully",
        },
        { status: 200 },
      );
    }

    const permissionsResponse = await fetch(
      `${BaseUrl}business/edit_attendant/${attendantId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          role: payload.role,
          ...(payload.set_permissions && {
            set_permissions: payload.set_permissions,
          }),
        }),
        cache: "no-store",
      },
    );

    if (!permissionsResponse.ok) {
      const permissionsError = await permissionsResponse
        .json()
        .catch(() => null);
      return NextResponse.json(
        {
          success: false,
          code: permissionsError?.code ?? null,
          message:
            permissionsError?.message ||
            "Details saved, but the role and permissions couldn't be updated",
          error: permissionsError?.error || "Permissions update failed",
        },
        { status: permissionsResponse.status },
      );
    }

    // Successful response
    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Attendant updated  successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
