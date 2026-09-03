import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/**
 * Starts an expense payout for a business.
 *
 * Comes back either executed (`SUCCESS`) or queued for approval, depending on
 * the caller's permissions, the business limits and whether a PIN was sent —
 * so callers must read `data.status` rather than assuming the money moved.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `expenses/transfers/initiate/${id}/`,
    method: "POST",
    body,
    errorMessage: "Could not submit the transfer",
  });
}
