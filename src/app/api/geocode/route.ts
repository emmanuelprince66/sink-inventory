import {
  GOOGLE_PLACES_AUTOCOMPLETE,
  REGION_CODES,
  notConfigured,
  type GeocodeSuggestion,
} from "@/lib/googlePlaces";
import { NextRequest, NextResponse } from "next/server";

// Proxies Google Places Autocomplete (New).
//
// A proxy rather than calling Google from the browser: the key stays
// server-side and never ships in the client bundle, which matches how every
// other external call in this app is made. It also means the key can be locked
// to nothing but this server.
//
// Predictions carry NO coordinates — Google does not return geometry from
// Autocomplete at all. The client resolves the picked one through
// /api/geocode/details, which is both the documented flow and what makes a
// session token bill as a single lookup rather than one per keystroke.

export type { GeocodeSuggestion };

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  // "lng,lat" — biases results toward the merchant's own pickup point so local
  // streets outrank same-named streets in another state.
  const proximity = request.nextUrl.searchParams.get("proximity") || "";
  const sessionToken =
    request.nextUrl.searchParams.get("sessionToken") || undefined;

  // No key configured → report it plainly instead of 500ing. The
  // AddressAutocomplete component degrades to a plain text input when it sees
  // `disabled: true`, so the forms keep working without a Google account.
  if (!apiKey) {
    return NextResponse.json(
      notConfigured("Address lookup is not configured (GOOGLE_MAPS_API_KEY is unset)"),
      { status: 200 },
    );
  }

  if (q.length < 3) {
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }

  const [lng, lat] = proximity.split(",").map(Number);

  try {
    const response = await fetch(GOOGLE_PLACES_AUTOCOMPLETE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: q,
        includedRegionCodes: REGION_CODES,
        languageCode: "en",
        ...(sessionToken ? { sessionToken } : {}),
        ...(Number.isFinite(lat) && Number.isFinite(lng)
          ? {
              locationBias: {
                circle: {
                  center: { latitude: lat, longitude: lng },
                  // 50km: wide enough to cover a city and its outskirts,
                  // tight enough that another state's streets rank below.
                  radius: 50000,
                },
              },
            }
          : {}),
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          message:
            data?.error?.message || data?.message || "Address lookup failed",
        },
        { status: response.status },
      );
    }

    const suggestions: GeocodeSuggestion[] = (data?.suggestions ?? [])
      .map((entry: any, index: number) => {
        const prediction = entry?.placePrediction;
        if (!prediction?.placeId) return null;

        const main = prediction.structuredFormat?.mainText?.text || "";
        const secondary = prediction.structuredFormat?.secondaryText?.text || "";

        return {
          id: prediction.placeId,
          placeId: prediction.placeId,
          label: prediction.text?.text || [main, secondary].filter(Boolean).join(", "),
          // Main text is the street line; the rest is city/state context that
          // Place Details will break out properly on select.
          address: main,
          city: "",
          state: "",
          stateCode: "",
          country: "Nigeria",
          // Resolved on select — see the note above.
          latitude: "",
          longitude: "",
          precision: prediction.types?.[0] || "",
        } satisfies GeocodeSuggestion;
      })
      .filter((s: GeocodeSuggestion | null): s is GeocodeSuggestion => s !== null);

    return NextResponse.json(
      { success: true, data: suggestions, message: "Addresses fetched" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Places autocomplete error:", error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        message:
          error instanceof Error ? error.message : "Address lookup failed",
      },
      { status: 500 },
    );
  }
}
