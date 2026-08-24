import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

// GET /notification/unread-count/{business_id}/ — seeds the badges before the
// socket connects. Static segment, so it resolves ahead of [id].
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToApi(request, {
    path: `notification/unread-count/${id}/`,
    label: "fetch notification counts",
  });
}
