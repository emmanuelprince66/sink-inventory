import { pickSearchParams, proxyToApi } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** Filters the endpoint accepts; anything else is dropped rather than forwarded. */
const FORWARDED = ["limit", "search"] as const;

/**
 * Who this wallet has paid before, newest first and one row per account.
 *
 * Saves retyping a ten-digit account number for the people a merchant pays
 * every week. The row carries no transfer `ref`, so picking one still has to
 * go through /wallet/beneficiary_enquiry/ — see the client for why that is
 * not a detail worth skipping.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyToApi({
    path: `wallet/recent_beneficiaries/${id}/`,
    search: pickSearchParams(request, FORWARDED),
    errorMessage: "Could not load recent beneficiaries",
  });
}
