import { BaseUrl } from "@/constants/base-url";
import { NextRequest, NextResponse } from "next/server";

/**
 * Finds a product anywhere in the catalogue by its SKU / barcode.
 *
 * `GET /product/sku/?sku={barcode}` → one flat product object, or a miss.
 *
 * A barcode names a manufactured product rather than one shop's listing of it,
 * so whatever another business already recorded against that code — the name,
 * the photo, the unit — describes the same item in this one's hands.
 *
 * Public and unauthenticated, as the backend serves it. Proxied rather than
 * called from the page so there is no origin for CORS to refuse, and so a
 * miss can be normalised to a single shape.
 */
export async function GET(request: NextRequest) {
  const sku = request.nextUrl.searchParams.get("sku");

  if (!sku) {
    return NextResponse.json(
      { success: false, message: "sku is required" },
      { status: 400 },
    );
  }

  const url = new URL(`${BaseUrl}product/sku/`);
  url.searchParams.set("sku", sku);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    // A barcode nobody has listed is an ordinary outcome, not a failure. It
    // comes back as an empty success so the caller has one thing to check.
    if (response.status === 404) {
      return NextResponse.json({ success: true, data: null }, { status: 200 });
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: payload?.message || "Could not look that barcode up",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch (error) {
    console.error("SKU lookup error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Could not look that barcode up",
      },
      { status: 500 },
    );
  }
}
