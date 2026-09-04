import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/**
 * Turns BNPL on or off for a business.
 *
 * The general update-business route sends multipart FormData, which would put
 * `enable_bnpl` on the wire as the string "true" or "false" — and "false" is
 * truthy to most parsers. A boolean this consequential goes up as JSON.
 *
 * The eligibility rules (active wallet, Tier 3 for an individual, approved
 * documents for a company) are enforced upstream and come back as a 400 keyed
 * on `enable_bnpl`; the caller reads that message rather than this route
 * trying to second-guess who qualifies.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `business/${id}/`,
    method: "PATCH",
    body,
    errorMessage: "Could not update your BNPL setting",
  });
}
