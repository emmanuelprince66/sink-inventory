import { pickSearchParams, proxyToApi } from "@/lib/api-proxy";
import { NextRequest, NextResponse } from "next/server";

/**
 * Looks up an in-store draft by the code the customer shows at the counter.
 *
 * Proxied rather than called from the browser because this endpoint is
 * authenticated — it returns another person's basket, name and phone number,
 * so it must never be reachable without the attendant's token, which lives in
 * an httpOnly cookie the client cannot read.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const search = pickSearchParams(request, ["code"]);

  if (!search.get("code")) {
    return NextResponse.json(
      { error: "An order code is required" },
      { status: 400 },
    );
  }

  return proxyToApi({
    path: `order/business/${id}/instore-lookup/`,
    search,
    errorMessage: "Could not find that order code",
  });
}
