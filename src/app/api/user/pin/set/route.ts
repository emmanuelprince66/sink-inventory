import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** Sets a first transaction PIN. Rejected upstream if one already exists. */
export async function POST(request: NextRequest) {
  const [body, error] = await readJsonBody(request);
  if (error) return error;

  return proxyToApi({
    path: "user/pin/set/",
    method: "POST",
    body,
    errorMessage: "Could not set your PIN",
  });
}
