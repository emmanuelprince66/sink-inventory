import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

// GET /customer/transactions/{id}/ — one ledger across purchases, wallet
// movements, debt settlements, loyalty rewards and referral bonuses.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToApi(request, {
    path: `customer/transactions/${id}/`,
    forwardParams: [
      "page",
      "limit",
      "type",
      "flow",
      "status",
      "start_date",
      "end_date",
    ],
    label: "fetch customer transactions",
  });
}
