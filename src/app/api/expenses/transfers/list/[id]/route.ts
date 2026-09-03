import { pickSearchParams, proxyToApi } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** Filters the list endpoint accepts; anything else is dropped rather than forwarded. */
const FORWARDED = [
  "status",
  "start_date",
  "end_date",
  "user",
  "search",
  "page",
] as const;

/** A business's expense transfers, newest first, paginated. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return proxyToApi({
    path: `expenses/transfers/${id}/`,
    search: pickSearchParams(request, FORWARDED),
    errorMessage: "Could not load expense transfers",
  });
}
