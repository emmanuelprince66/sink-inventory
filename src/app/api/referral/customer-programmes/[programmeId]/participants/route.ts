import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

type Context = { params: Promise<{ programmeId: string }> };

// GET  — who is enrolled, with their code, link, referral count and earnings.
// POST — enrol a customer by name and phone; the API mints the code and link.
export async function GET(request: NextRequest, { params }: Context) {
  const { programmeId } = await params;
  return proxyToApi(request, {
    path: `referral/customer-programmes/${programmeId}/participants/`,
    forwardParams: ["search", "page", "limit"],
    label: "fetch referral participants",
  });
}

export async function POST(request: NextRequest, { params }: Context) {
  const { programmeId } = await params;
  return proxyToApi(request, {
    path: `referral/customer-programmes/${programmeId}/participants/`,
    method: "POST",
    label: "add referral participant",
  });
}
