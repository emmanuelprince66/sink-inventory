import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/**
 * Settles an in-store draft at the counter.
 *
 * Does double duty, and which one depends on what the customer already paid:
 *
 *   - COUNTER draft: this is the sale. Stock is deducted here, not at draft
 *     creation, so an abandoned basket never leaks inventory — and a 400
 *     ("Insufficient stock for '<name>'") is a real possibility when someone
 *     else bought the last unit while this customer walked to the till.
 *
 *   - BNPL/ONLINE draft that's already paid: the sale exists already. Posting
 *     just `{ order_code }` records that the goods were handed over and by
 *     whom, and comes back 200 rather than 201. Nothing is charged twice.
 *
 * The upstream endpoint now mirrors sale/create's payment fields, so split,
 * partial, credit and loyalty all pass straight through.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `order/business/${id}/instore-finalize/`,
    method: "POST",
    body,
    errorMessage: "Could not complete this order",
  });
}
