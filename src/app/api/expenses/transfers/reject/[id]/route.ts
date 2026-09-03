import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** Declines a transfer and records why. No PIN — nothing leaves the wallet. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `expenses/transfers/${id}/reject/`,
    method: "POST",
    body,
    errorMessage: "Could not reject the transfer",
  });
}
