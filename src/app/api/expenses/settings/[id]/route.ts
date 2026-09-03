import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** The business's payout limits and approval policy. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyToApi({
    path: `expenses/settings/${id}/`,
    errorMessage: "Could not load expense settings",
  });
}

/** Owner-only. Accepts any subset of the settings fields. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `expenses/settings/${id}/`,
    method: "PATCH",
    body,
    errorMessage: "Could not update expense settings",
  });
}
