import { NextRequest, NextResponse } from "next/server";

// Reverse geocode: coordinates → a readable address. Used by the Shipbubble
// pickup settings, where the merchant captures their location from the device
// and we turn that fix into something a rider can read.
//
// Deliberately mirrors /api/geocode's response contract (success/data/message,
// with data being GeocodeSuggestion[]) so the client helpers and the
// suggestion-applying code in useShipbubbleHook work unchanged. The array holds
// at most one entry.

const GEOAPIFY_REVERSE = "https://api.geoapify.com/v1/geocode/reverse";

const normalizeStateName = (name?: string) =>
  (name || "").replace(/\s+state$/i, "").trim();

const normalizeStateCode = (code?: string) =>
  (code || "").replace(/^NG-/i, "").toUpperCase();

const toFixed6 = (n: unknown): string => {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(6) : "";
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.GEOAPIFY_KEY;
  const lat = request.nextUrl.searchParams.get("lat") || "";
  const lon = request.nextUrl.searchParams.get("lon") || "";

  // Matches /api/geocode: report the missing key rather than 500ing, so the
  // caller can fall back to manual entry instead of showing an error.
  if (!apiKey) {
    return NextResponse.json(
      {
        success: true,
        disabled: true,
        data: [],
        message: "Geocoding is not configured (GEOAPIFY_KEY is unset)",
      },
      { status: 200 },
    );
  }

  if (!lat || !lon || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
    return NextResponse.json(
      { success: false, data: [], message: "lat and lon are required" },
      { status: 400 },
    );
  }

  try {
    const url = new URL(GEOAPIFY_REVERSE);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("lang", "en");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          message: data?.message || data?.error || "Reverse lookup failed",
        },
        { status: response.status },
      );
    }

    const feature = Array.isArray(data?.features) ? data.features[0] : null;

    if (!feature) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "No address found at these coordinates",
        },
        { status: 200 },
      );
    }

    const p = feature.properties || {};
    const streetLine =
      [p.housenumber, p.street].filter(Boolean).join(" ") ||
      p.address_line1 ||
      p.name ||
      "";

    return NextResponse.json(
      {
        success: true,
        data: [
          {
            id: String(p.place_id || feature.id || "reverse"),
            label: p.formatted || streetLine,
            address: streetLine,
            city: p.city || p.town || p.village || p.suburb || "",
            state: normalizeStateName(p.state),
            stateCode: normalizeStateCode(p.state_code),
            country: p.country || "Nigeria",
            // Echo the requested point, not the provider's snapped centroid —
            // the device fix is more precise than the matched address.
            latitude: toFixed6(lat),
            longitude: toFixed6(lon),
            precision: p.result_type || "",
          },
        ],
        message: "Address resolved",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        message:
          error instanceof Error ? error.message : "Reverse lookup failed",
      },
      { status: 500 },
    );
  }
}
