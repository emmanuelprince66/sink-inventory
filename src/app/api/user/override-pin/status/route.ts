import { proxyToApi } from "@/lib/api-proxy";

/** Whether the signed-in user has a manager override PIN, and may set one. */
export async function GET() {
  return proxyToApi({
    path: "user/override_pin/status/",
    errorMessage: "Could not check your override PIN",
  });
}
