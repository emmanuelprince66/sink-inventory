import { NextRequest, NextResponse } from "next/server";

// Streams a loyalty QR PNG through our own origin.
//
// The S3 objects are publicly readable but the bucket sends no
// Access-Control-Allow-Origin header. That leaves two bad options in the
// browser: request it with crossOrigin="anonymous" and have it blocked
// outright, or request it without and taint the canvas so html2canvas can no
// longer export the card. Proxying makes it same-origin, which avoids both.
//
// Locked to the known bucket host — a proxy that fetches any URL a caller
// supplies is an SSRF hole, not a convenience.
const ALLOWED_HOSTS = new Set([
  "sync360-bucket.s3.amazonaws.com",
  "sync-bck-new.s3.amazonaws.com",
]);

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json(
      { success: false, message: "url is required" },
      { status: 400 },
    );
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json(
      { success: false, message: "url is not valid" },
      { status: 400 },
    );
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json(
      { success: false, message: "That host is not allowed" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(target.toString(), { cache: "no-store" });

    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, message: "Could not fetch the QR image" },
        { status: upstream.status },
      );
    }

    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/png",
        // The QR for a programme never changes, so let the browser keep it.
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("QR image proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Could not fetch the image",
      },
      { status: 500 },
    );
  }
}
