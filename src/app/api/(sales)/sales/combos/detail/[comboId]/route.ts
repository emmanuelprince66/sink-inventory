import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

type Context = { params: Promise<{ comboId: string }> };

// GET /sale/combos/detail/{combo_id}/ — what a combo is made of.
// Keyed on combo_id, not on a sale id, so the View modal resolves the combo
// behind a row rather than that one transaction.
export async function GET(request: NextRequest, { params }: Context) {
  const { comboId } = await params;
  return proxyToApi(request, {
    path: `sale/combos/detail/${comboId}/`,
    label: "fetch combo detail",
  });
}
