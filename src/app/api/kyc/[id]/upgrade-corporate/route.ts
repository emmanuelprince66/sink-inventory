import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// /wallet/upgrade_corporate_account/{id}/ — the company's filings, its TIN and
// a record per director. {id} is the business id.
//
// GET reports what has already been accepted: each document comes back as a
// URL rather than a flag, so the form can show what is on file and ask only
// for what is missing.

const authorize = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = await authorize();

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(
      `${BaseUrl}wallet/upgrade_corporate_account/${id}/`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // A business that has never submitted has nothing to report — that is an
      // empty state, not a failure the merchant can act on.
      if (response.status === 404) {
        return NextResponse.json({ success: true, data: null }, { status: 200 });
      }
      return NextResponse.json(
        {
          error:
            data?.error || data?.message || "Failed to read corporate upgrade",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Corporate upgrade read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = await authorize();

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
    // Forwarded as multipart, unread: the body carries seven company documents
    // plus two per director, and re-encoding it here would only be a chance to
    // corrupt them. Content-Type is deliberately not set — fetch derives it
    // from the FormData along with the boundary, and setting it by hand loses
    // the boundary and the upload fails to parse.
    const form = await request.formData();

    const response = await fetch(
      `${BaseUrl}wallet/upgrade_corporate_account/${id}/`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
        cache: "no-store",
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error || data?.message || "Failed to submit company documents",
          details: data,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Corporate upgrade error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
