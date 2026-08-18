import {
  GOOGLE_PLACE_DETAILS,
  notConfigured,
  suggestionFromComponents,
} from "@/lib/googlePlaces";
import { NextRequest, NextResponse } from "next/server";

// Resolves one picked prediction into a full address with coordinates.
//
// This endpoint exists because Google's Autocomplete returns no geometry.
// Calling it once, on select, is the documented pattern — and passing the same
// sessionToken used for the predictions is what makes Google bill the whole
// interaction as a single Autocomplete session instead of per keystroke.
//
// The field mask is not optional: Place Details is billed by SKU according to
// which fields you ask for, so requesting only these four keeps every lookup
// in the cheapest tier that still carries coordinates.
const FIELD_MASK = "id,formattedAddress,addressComponents,location,types";

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = (request.nextUrl.searchParams.get("place_id") || "").trim();
  const sessionToken = request.nextUrl.searchParams.get("sessionToken") || "";

  if (!apiKey) {
    return NextResponse.json(
      notConfigured("Address lookup is not configured (GOOGLE_MAPS_API_KEY is unset)"),
      { status: 200 },
    );
  }

  if (!placeId) {
    return NextResponse.json(
      { success: false, data: [], message: "place_id is required" },
      { status: 400 },
    );
  }

  try {
    const url = new URL(`${GOOGLE_PLACE_DETAILS}/${encodeURIComponent(placeId)}`);
    if (sessionToken) url.searchParams.set("sessionToken", sessionToken);
    url.searchParams.set("languageCode", "en");

    const response = await fetch(url.toString(), {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          message:
            data?.error?.message || data?.message || "Could not resolve address",
        },
        { status: response.status },
      );
    }

    const suggestion = suggestionFromComponents({
      id: data?.id || placeId,
      components: data?.addressComponents ?? [],
      formattedAddress: data?.formattedAddress,
      latitude: data?.location?.latitude,
      longitude: data?.location?.longitude,
      precision: data?.types?.[0],
    });

    // Mirrors /api/geocode's contract: data is always an array, so the client
    // helpers and the AddressAutocomplete dropdown stay interchangeable.
    return NextResponse.json(
      { success: true, data: [suggestion], message: "Address resolved" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Place details error:", error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        message:
          error instanceof Error ? error.message : "Could not resolve address",
      },
      { status: 500 },
    );
  }
}
