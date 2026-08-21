import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

// GET /referral/customer-programmes/overview/ — the five headline counters.
// Static segment, so it resolves ahead of [programmeId].
export const GET = (request: NextRequest) =>
  proxyToApi(request, {
    path: "referral/customer-programmes/overview/",
    forwardParams: ["business_id", "search", "page", "limit"],
    requireParams: ["business_id"],
    label: "fetch referral overview",
  });
