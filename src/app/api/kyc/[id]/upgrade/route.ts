import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// POST /wallet/upgrade_account/{id}/ — raises an individual account's tier by
// adding whichever of bvn / nin / address it is still missing. {id} is the
// business id, the same one wallet/create_bank_account/ takes.
//
// Opening the account stays with create_bank_account: this endpoint's body has
// no room for the name and date of birth that go with it.
export async function POST(
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

  if (!id) {
    return NextResponse.json(
      { error: "Business id is required" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || !Object.keys(body).length) {
      return NextResponse.json(
        { error: "Nothing to upgrade — send at least one of bvn, nin, address" },
        { status: 400 },
      );
    }

    const response = await fetch(`${BaseUrl}wallet/upgrade_account/${id}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.error || data?.message || "Failed to upgrade account",
          details: data,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Upgrade account error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
