import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

// PATCH, not POST — the first integration guide said POST, the swagger says
// PATCH, and the swagger is what the server actually implements.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  const { notificationId } = await params;
  return proxyToApi(request, {
    path: `notification/mark-read/${notificationId}/`,
    method: "PATCH",
    label: "mark notification read",
  });
}
