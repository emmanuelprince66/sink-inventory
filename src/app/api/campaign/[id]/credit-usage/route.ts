import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

// GET /campaign/credit-usage/{business_id}/ — the credit ledger behind the
// Usage tab. Business-scoped, same as campaign/automation and campaign/group.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToApi(request, {
    path: `campaign/credit-usage/${id}/`,
    forwardParams: ["page", "limit", "search", "channel", "usage_type"],
    label: "fetch campaign credit usage",
  });
}
