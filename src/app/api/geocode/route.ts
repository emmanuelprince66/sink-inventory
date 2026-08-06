import { NextRequest, NextResponse } from "next/server";

// Proxies Geoapify's autocomplete endpoint.
//
// Geoapify rather than Mapbox/Google: it's the provider already in use on
// bounest-website (src/core/lib/geocode.ts), the free tier needs no card, and
// the account/key already exists — so this costs nothing new.
//
// Why a proxy instead of calling Geoapify from the browser: the key stays
// server-side and never ships in the client bundle, which matches how every
// other external call in this app is made. Swapping providers later is a
// one-file change — the client contract below doesn't move.

const GEOAPIFY_AUTOCOMPLETE =
  "https://api.geoapify.com/v1/geocode/autocomplete";

// Shipbubble is Nigeria-only, so every lookup is filtered to NG. Unfiltered,
// "Allen Avenue" returns Texas ahead of Ikeja.
const COUNTRY_FILTER = "countrycode:ng";

export interface GeocodeSuggestion {
  id: string;
  /** Full human-readable line — what the dropdown row shows. */
  label: string;
  /** Street line only — what we drop into the address/street field. */
  address: string;
  city: string;
  state: string;
  /** ISO subdivision code when the provider gives one, e.g. "LA". May be "" —
   * the client falls back to matching on the state name. */
  stateCode: string;
  country: string;
  latitude: string;
  longitude: string;
  /** Geoapify result_type — "building"/"street" are precise, "city" is a centroid. */
  precision: string;
}

// Geoapify returns Nigerian states as either "Lagos" or "Lagos State";
// country-state-city only knows the bare form, and the client matches on it.
const normalizeStateName = (name?: string) =>
  (name || "").replace(/\s+state$/i, "").trim();

const normalizeStateCode = (code?: string) =>
  (code || "").replace(/^NG-/i, "").toUpperCase();

const toFixed6 = (n: unknown): string => {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(6) : "";
};

const mapFeature = (feature: any, index: number): GeocodeSuggestion | null => {
  const p = feature?.properties || {};

  const latitude = toFixed6(p.lat ?? feature?.geometry?.coordinates?.[1]);
  const longitude = toFixed6(p.lon ?? feature?.geometry?.coordinates?.[0]);

  // A suggestion without coordinates is useless to us — that's the whole point.
  if (!latitude || !longitude) return null;

  const streetLine =
    [p.housenumber, p.street].filter(Boolean).join(" ") ||
    p.address_line1 ||
    p.name ||
    "";

  return {
    id: String(p.place_id || feature?.id || index),
    label: p.formatted || streetLine,
    address: streetLine,
    // Geoapify classifies Nigerian towns under any of these depending on size.
    city: p.city || p.town || p.village || p.suburb || "",
    state: normalizeStateName(p.state),
    stateCode: normalizeStateCode(p.state_code),
    country: p.country || "Nigeria",
    latitude,
    longitude,
    precision: p.result_type || "",
  };
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.GEOAPIFY_KEY;
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const limit = request.nextUrl.searchParams.get("limit") || "6";
  // "lng,lat" — biases results toward the merchant's own pickup point so
  // local streets outrank same-named streets in another state.
  const proximity = request.nextUrl.searchParams.get("proximity") || "";

  // No key configured → report it plainly instead of 500ing. The
  // AddressAutocomplete component degrades to a plain text input when it sees
  // `disabled: true`, so the forms keep working without a Geoapify account.
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

  if (q.length < 3) {
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }

  try {
    const url = new URL(GEOAPIFY_AUTOCOMPLETE);
    url.searchParams.set("text", q);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("lang", "en");
    url.searchParams.set("limit", limit);
    url.searchParams.set("filter", COUNTRY_FILTER);
    // Geoapify takes a single `bias` param, pipe-separated. Proximity is
    // "lon,lat" here — the inverse of the lat,lng order used everywhere else.
    url.searchParams.set(
      "bias",
      proximity
        ? `proximity:${proximity}|${COUNTRY_FILTER}`
        : COUNTRY_FILTER,
    );

    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          message:
            data?.message || data?.error || "Address lookup failed",
        },
        { status: response.status },
      );
    }

    const features: any[] = Array.isArray(data?.features) ? data.features : [];
    const suggestions = features
      .map(mapFeature)
      .filter((s): s is GeocodeSuggestion => s !== null);

    return NextResponse.json(
      { success: true, data: suggestions, message: "Addresses fetched" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Geocode error:", error);
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
