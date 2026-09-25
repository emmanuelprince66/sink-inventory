import { pickSearchParams, proxyToApi } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** Filters the endpoint accepts; anything else is dropped rather than forwarded. */
const FORWARDED = [
  "stage",
  "search",
  "start_date",
  "end_date",
  "page",
  "page_size",
] as const;

/**
 * BNPL payouts that Akawopay has not settled into the wallet yet.
 *
 * Separate from the wallet history: a settled BNPL sale shows up there as an
 * ordinary credit with `is_bnpl`, while these are sales the customer has
 * already walked out with and the merchant has not been paid for.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyToApi({
    path: `business/${id}/pending_bnpl/`,
    search: pickSearchParams(request, FORWARDED),
    errorMessage: "Could not load pending BNPL settlements",
  });
}
