import { proxyToApi } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** One transfer in full, keyed on the transfer id rather than the business. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyToApi({
    path: `expenses/transfers/single/${id}/`,
    errorMessage: "Could not load the transfer",
  });
}
