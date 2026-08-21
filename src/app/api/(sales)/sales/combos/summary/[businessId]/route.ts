import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

type Context = { params: Promise<{ businessId: string }> };

// GET /sale/combos/summary/{business_id}/ — combos that have actually sold.
// The date params are forwarded on spec: the Sales screen already has one date
// filter, and this table sits under it. If the backend ignores them the call
// still succeeds, so forwarding costs nothing and saves a second pass.
export async function GET(request: NextRequest, { params }: Context) {
  const { businessId } = await params;
  return proxyToApi(request, {
    path: `sale/combos/summary/${businessId}/`,
    forwardParams: ["start_date", "end_date", "page", "limit", "search"],
    label: "fetch combo sales",
  });
}
