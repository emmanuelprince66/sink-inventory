import {
  GOOGLE_PLACE_DETAILS,
  LEGACY_DETAILS,
  isServiceDisabled,
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
const FIELD_MASK =
  "id,displayName,formattedAddress,addressComponents,location,types";

/** Same contract, served from the legacy Places endpoint. */
const legacyDetails = async (
  apiKey: string,
  placeId: string,
  sessionToken?: string,
) => {
  const url = new URL(LEGACY_DETAILS);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "en");
  // The legacy equivalent of the field mask — same reason, same saving.
  url.searchParams.set(
    "fields",
    "place_id,name,formatted_address,address_component,geometry/location,type",
  );
  if (sessionToken) url.searchParams.set("sessiontoken", sessionToken);

  const response = await fetch(url.toString(), { cache: "no-store" });
  const data = await response.json().catch(() => ({}));

  if (data?.status !== "OK" || !data?.result) {
    return {
      success: false,
      data: [],
      message: data?.error_message || "Could not resolve address",
    };
  }

  const result = data.result;
  return {
    success: true,
    data: [
      suggestionFromComponents({
        id: result.place_id || placeId,
        components: result.address_components ?? [],
        formattedAddress: result.formatted_address,
        name: result.name,
        latitude: result.geometry?.location?.lat,
        longitude: result.geometry?.location?.lng,
        precision: result.types?.[0],
      }),
    ],
    message: "Address resolved",
  };
};

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

    // Mirrors /api/address: fall back only when the new API is switched off,
    // so a project on either generation resolves picks the same way.
    if (isServiceDisabled(response.status, data)) {
      return NextResponse.json(
        await legacyDetails(apiKey, placeId, sessionToken),
        { status: 200 },
      );
    }

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
      name: data?.displayName?.text,
      latitude: data?.location?.latitude,
      longitude: data?.location?.longitude,
      precision: data?.types?.[0],
    });

    // Mirrors /api/address's contract: data is always an array, so the client
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
