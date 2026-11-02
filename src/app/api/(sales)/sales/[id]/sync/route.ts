import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

/** Offline POS sales, up to 50 per call. Idempotent on client_sale_id. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToApi(request, {
    path: `sale/${id}/sync/`,
    method: "POST",
    label: "sync offline sales",
  });
}
