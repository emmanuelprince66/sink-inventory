import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/**
 * One attendant's role and permission flags.
 *
 * The upstream path is attendant_permissions with an underscore; this route
 * keeps the hyphen the rest of the app's routes use.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyToApi({
    path: `business/attendant_permissions/${id}/`,
    errorMessage: "Could not load staff permissions",
  });
}

/** Owner-only. Partial updates supported. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: `business/attendant_permissions/${id}/`,
    method: "PATCH",
    body,
    errorMessage: "Could not update staff permissions",
  });
}
