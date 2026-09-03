import { proxyToApi } from "@/lib/api-proxy";

/** Whether the signed-in user has a transaction PIN yet. */
export async function GET() {
  return proxyToApi({
    path: "user/pin/status/",
    errorMessage: "Could not check your PIN status",
  });
}
