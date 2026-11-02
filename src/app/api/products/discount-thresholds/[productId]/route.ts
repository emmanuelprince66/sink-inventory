import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ productId: string }> };

/** Volume discount tiers for one product or variation. */
export async function GET(request: NextRequest, { params }: Params) {
  const { productId } = await params;
  return proxyToApi(request, {
    path: `product/discount_thresholds/${productId}/`,
    label: "load discount tiers",
  });
}

/** Replaces every tier with `{ thresholds: [...] }`; an empty list clears them. */
export async function POST(request: NextRequest, { params }: Params) {
  const { productId } = await params;
  return proxyToApi(request, {
    path: `product/discount_thresholds/${productId}/`,
    method: "POST",
    label: "save discount tiers",
  });
}
