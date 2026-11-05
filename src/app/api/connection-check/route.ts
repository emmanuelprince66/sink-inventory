import { BaseUrl } from "@/constants/base-url";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Can the API be reached? The POS asks this while it's working offline. Any
 * answer below 500 counts, even a 404: it means the API is up and responding.
 */
export async function GET() {
  try {
    const response = await fetch(BaseUrl, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    return NextResponse.json(
      { reachable: response.status < 500 },
      { status: response.status < 500 ? 200 : 503 },
    );
  } catch {
    return NextResponse.json({ reachable: false }, { status: 503 });
  }
}
