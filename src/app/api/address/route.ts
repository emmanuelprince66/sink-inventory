import {
  activeProvider,
  notConfigured,
  REGION_CODES,
  type AddressSuggestion,
} from "@/lib/addressContract";
import {
  COUNTRY_FILTER,
  GEOAPIFY_AUTOCOMPLETE,
  geoapifyError,
  suggestionFromFeature,
} from "@/lib/geoapify";
import {
  GOOGLE_PLACES_AUTOCOMPLETE,
  LEGACY_AUTOCOMPLETE,
  isServiceDisabled,
  suggestionFromLegacyPrediction,
} from "@/lib/googlePlaces";
import { NextRequest, NextResponse } from "next/server";

// Address autocomplete, served by whichever provider ADDRESS_PROVIDER selects
// — Geoapify by default, Google when explicitly switched. Both answer in the
// same AddressSuggestion shape, so the client never branches.
//
// A proxy rather than calling Google from the browser: the key stays
// server-side and never ships in the client bundle, which matches how every
// other external call in this app is made. It also means the key can be locked
// to nothing but this server.
//
// Predictions carry NO coordinates — Google does not return geometry from
// Autocomplete at all. The client resolves the picked one through
// /api/address/details, which is both the documented flow and what makes a
// session token bill as a single lookup rather than one per keystroke.

export type { AddressSuggestion };

/** Same contract, served from the legacy Places endpoint. */
const legacyAutocomplete = async (
  apiKey: string,
  q: string,
  sessionToken?: string,
) => {
  const url = new URL(LEGACY_AUTOCOMPLETE);
  url.searchParams.set("input", q);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "en");
  url.searchParams.set("components", `country:${REGION_CODES[0]}`);
  // Legacy spells it lowercase; it buys the same session-based billing.
  if (sessionToken) url.searchParams.set("sessiontoken", sessionToken);

  const response = await fetch(url.toString(), { cache: "no-store" });
  const data = await response.json().catch(() => ({}));

  if (data?.status && !["OK", "ZERO_RESULTS"].includes(data.status)) {
    return {
      success: false,
      data: [] as AddressSuggestion[],
      message: data?.error_message || "Address lookup failed",
    };
  }

  return {
    success: true,
    data: (data?.predictions ?? [])
      .map(suggestionFromLegacyPrediction)
      .filter((s: AddressSuggestion | null): s is AddressSuggestion => s !== null),
    message: "Addresses fetched",
  };
};

/**
 * Geoapify autocomplete. One call, coordinates included — no details round
 * trip and no session token, because neither is billed or needed here.
 */
const geoapifyAutocomplete = async (
  q: string,
  limit: string,
  proximity: string,
) => {
  const apiKey = process.env.GEOAPIFY_KEY;

  if (!apiKey) {
    return notConfigured("Address lookup is not configured (GEOAPIFY_KEY is unset)");
  }

  const url = new URL(GEOAPIFY_AUTOCOMPLETE);
  url.searchParams.set("text", q);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", limit);
  url.searchParams.set("filter", COUNTRY_FILTER);
  // Geoapify takes one pipe-separated `bias`. Proximity arrives as "lon,lat"
  // here — the inverse of the lat,lng order used everywhere else.
  url.searchParams.set(
    "bias",
    proximity ? `proximity:${proximity}|${COUNTRY_FILTER}` : COUNTRY_FILTER,
  );

  const response = await fetch(url.toString(), { cache: "no-store" });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      data: [] as AddressSuggestion[],
      message: geoapifyError(data, "Address lookup failed"),
    };
  }

  const features: any[] = Array.isArray(data?.features) ? data.features : [];

  return {
    success: true,
    data: features
      .map(suggestionFromFeature)
      .filter((s): s is AddressSuggestion => s !== null),
    message: "Addresses fetched",
  };
};

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const limit = request.nextUrl.searchParams.get("limit") || "6";
  // "lng,lat" — biases results toward the merchant's own pickup point so local
  // streets outrank same-named streets in another state.
  const proximity = request.nextUrl.searchParams.get("proximity") || "";
  const sessionToken =
    request.nextUrl.searchParams.get("sessionToken") || undefined;

  if (q.length < 3) {
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }

  if (activeProvider() === "geoapify") {
    try {
      return NextResponse.json(
        await geoapifyAutocomplete(q, limit, proximity),
        { status: 200 },
      );
    } catch (error) {
      console.error("Geoapify autocomplete error:", error);
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

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // No key configured → report it plainly instead of 500ing. The
  // AddressAutocomplete component degrades to a plain text input when it sees
  // `disabled: true`, so the forms keep working without a Google account.
  if (!apiKey) {
    return NextResponse.json(
      notConfigured("Address lookup is not configured (GOOGLE_MAPS_API_KEY is unset)"),
      { status: 200 },
    );
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

    // Only when Places API (New) is switched off on the project — every other
    // failure is reported as-is rather than quietly retried elsewhere.
    if (isServiceDisabled(response.status, data)) {
      return NextResponse.json(await legacyAutocomplete(apiKey, q, sessionToken), {
        status: 200,
      });
    }

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

    const suggestions: AddressSuggestion[] = (data?.suggestions ?? [])
      .map((entry: any, index: number) => {
        const prediction = entry?.placePrediction;
        if (!prediction?.placeId) return null;

        const main = prediction.structuredFormat?.mainText?.text || "";
        const secondary = prediction.structuredFormat?.secondaryText?.text || "";

        return {
          id: prediction.placeId,
          placeId: prediction.placeId,
          label: prediction.text?.text || [main, secondary].filter(Boolean).join(", "),
          secondary,
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
        } satisfies AddressSuggestion;
      })
      .filter((s: AddressSuggestion | null): s is AddressSuggestion => s !== null);

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
