import { proxyToApi } from "@/lib/api-proxy";

/** Every permission module, and what each role starts with. */
export async function GET() {
  return proxyToApi({
    path: "business/role_permission_defaults/",
    errorMessage: "Could not load role permissions",
  });
}
