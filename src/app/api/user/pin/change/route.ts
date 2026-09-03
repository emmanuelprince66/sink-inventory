import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** Replaces an existing transaction PIN, given the current one. */
export async function POST(request: NextRequest) {
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: "user/pin/change/",
    method: "POST",
    body,
    errorMessage: "Could not change your PIN",
  });
}
