import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/**
 * What a campaign would reach and cost, without sending it.
 *
 * A dry run, so it is safe to call on every change to the audience. The
 * numbers it returns cannot be worked out on this side: the backend dedupes a
 * customer who appears in a group, a segment and the picked list into one
 * recipient, and then drops anyone with no email (or no valid phone) for the
 * chosen channel. Counting the selection locally overstates both the audience
 * and the charge.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `campaign/estimate/${id}/`,
    method: "POST",
    body,
    errorMessage: "Could not work out who this campaign would reach",
  });
}
