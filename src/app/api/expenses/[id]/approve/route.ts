import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

// POST /expenses/{id}/approve/ — signs off a logged expense. Keyed on the
// expense id, not the business: the approver acts on one record.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `expenses/${id}/approve/`,
    method: "POST",
    body,
    errorMessage: "Could not approve this expense",
  });
}
