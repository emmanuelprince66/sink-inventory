import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

// POST /expenses/{id}/reject/ — declines a logged expense with a reason.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `expenses/${id}/reject/`,
    method: "POST",
    body,
    errorMessage: "Could not reject this expense",
  });
}
