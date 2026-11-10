import { proxyToApi, readJsonBody } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/** Sets a first manager override PIN. */
export async function POST(request: NextRequest) {
  const [body, error] = await readJsonBody(request);
  if (error) return error;
  return proxyToApi({
    path: "user/override_pin/set/",
    method: "POST",
    body,
    errorMessage: "Could not set your override PIN",
  });
}
