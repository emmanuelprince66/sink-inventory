import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

// POST /notification/mark-all-read/{business_id}/
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToApi(request, {
    path: `notification/mark-all-read/${id}/`,
    method: "POST",
    label: "mark all notifications read",
  });
}
