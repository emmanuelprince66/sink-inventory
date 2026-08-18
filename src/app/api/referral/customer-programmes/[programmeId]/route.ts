import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

type Context = { params: Promise<{ programmeId: string }> };

// GET   — a single programme.
// PATCH — rename, change the reward rate or cap, toggle notifications, or
//         pause it via is_active.
export async function GET(request: NextRequest, { params }: Context) {
  const { programmeId } = await params;
  return proxyToApi(request, {
    path: `referral/customer-programmes/${programmeId}/`,
    label: "fetch referral programme",
  });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const { programmeId } = await params;
  return proxyToApi(request, {
    path: `referral/customer-programmes/${programmeId}/`,
    method: "PATCH",
    label: "update referral programme",
  });
}
