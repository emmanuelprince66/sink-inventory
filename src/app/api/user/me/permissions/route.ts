import { proxyToApi } from "@/lib/api-proxy";

/** The signed-in user's role and permissions, as they are right now. */
export async function GET() {
  return proxyToApi({
    path: "user/me/permissions/",
    errorMessage: "Could not load your permissions",
  });
}
