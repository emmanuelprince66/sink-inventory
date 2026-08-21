import {
  GOOGLE_REVERSE_GEOCODE,
  notConfigured,
  suggestionFromComponents,
} from "@/lib/googlePlaces";
import { NextRequest, NextResponse } from "next/server";

// Reverse geocode: coordinates → a readable address. Used by the Shipbubble
// settings form when the merchant taps "use my current location".
//
// Deliberately mirrors /api/address's response contract (success/data/message,
// with data being AddressSuggestion[]) so the client helpers and the
// AddressAutocomplete dropdown stay interchangeable.
//
// Google's Geocoding API rather than Places here: reverse lookup takes raw
// coordinates, which Places has no equivalent for.

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  // Matches /api/address: report the missing key rather than 500ing, so the
  // caller can fall back to letting the merchant type the address.
  if (!apiKey) {
    return NextResponse.json(
      notConfigured("Address lookup is not configured (GOOGLE_MAPS_API_KEY is unset)"),
      { status: 200 },
    );
  }

  if (!lat || !lon) {
    return NextResponse.json(
      { success: false, data: [], message: "lat and lon are required" },
      { status: 400 },
    );
  }

  try {
    const url = new URL(GOOGLE_REVERSE_GEOCODE);
    url.searchParams.set("latlng", `${lat},${lon}`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("language", "en");
    // Street-level first; Google orders results narrowest-to-widest anyway,
    // but this drops plus-codes and postal boxes from the running.
    url.searchParams.set(
      "result_type",
      "street_address|premise|subpremise|route|neighborhood|locality",
    );

    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = await response.json().catch(() => ({}));

    // The Geocoding API answers 200 with a status field, so a failed lookup
    // has to be read out of the body rather than the HTTP code.
    if (!response.ok || (data?.status && data.status !== "OK")) {
      const zeroResults = data?.status === "ZERO_RESULTS";
      return NextResponse.json(
        {
          success: zeroResults,
          data: [],
          message:
            data?.error_message ||
            (zeroResults
              ? "No address at those coordinates"
              : "Reverse lookup failed"),
        },
        { status: zeroResults ? 200 : response.status || 502 },
      );
    }

    const results: any[] = Array.isArray(data?.results) ? data.results : [];
    const suggestions = results.slice(0, 1).map((result) =>
      suggestionFromComponents({
        id: result?.place_id || `${lat},${lon}`,
        components: result?.address_components ?? [],
        formattedAddress: result?.formatted_address,
        // Prefer the caller's own fix over the snapped result: the device
        // knows where it is better than the nearest matched building does.
        latitude: lat,
        longitude: lon,
        precision: result?.types?.[0],
      }),
    );

    return NextResponse.json(
      { success: true, data: suggestions, message: "Address resolved" },
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
