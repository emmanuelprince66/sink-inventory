import { NextRequest, NextResponse } from "next/server";

/**
 * Streams a product image through our own origin so the browser can turn it
 * into a File.
 *
 * The S3 objects are publicly readable but the bucket sends no
 * Access-Control-Allow-Origin header, so `fetch(url).blob()` from the page is
 * blocked outright. Creating a product uploads real files — a URL is only
 * honoured on edit, as a kept id — so an image found by a barcode scan has to
 * be fetched, turned into a File and uploaded like any other. Proxying makes
 * it same-origin, which is what lets that happen.
 *
 * Locked to the known buckets: a proxy that fetches any URL a caller supplies
 * is an SSRF hole, not a convenience.
 */
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
        { success: false, message: "Could not fetch the image" },
        { status: upstream.status },
      );
    }

    const contentType = upstream.headers.get("content-type") || "";
    // Only images come back through here. Without this the allow-list alone
    // would still let a caller stream any object the bucket happens to hold.
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "That file is not an image" },
        { status: 400 },
      );
    }

    return new NextResponse(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // A product image at a given URL does not change, so let the browser
        // keep it — a merchant scanning a shelf hits the same few images.
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
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
