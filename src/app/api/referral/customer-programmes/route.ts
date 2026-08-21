import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

// GET  /referral/customer-programmes/ — list, paginated and searchable.
// POST /referral/customer-programmes/ — create one.
export const GET = (request: NextRequest) =>
  proxyToApi(request, {
    path: "referral/customer-programmes/",
    forwardParams: ["business_id", "search", "page", "limit"],
    requireParams: ["business_id"],
    label: "fetch referral programmes",
  });

export const POST = (request: NextRequest) =>
  proxyToApi(request, {
    path: "referral/customer-programmes/",
    method: "POST",
    forwardParams: ["business_id"],
    requireParams: ["business_id"],
    label: "create referral programme",
  });
