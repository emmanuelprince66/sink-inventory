import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/**
 * Approves a transfer and dispatches the payout.
 *
 * Takes the approver's transaction PIN. On bank success the backend writes the
 * expense record and moves the wallet, so this is the point of no return.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `expenses/transfers/${id}/approve/`,
    method: "POST",
    body,
    errorMessage: "Could not approve the transfer",
  });
}
