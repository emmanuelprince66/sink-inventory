// Shared shaping for the Google Places / Geocoding responses behind
// /api/geocode. Keeping it out of the route files means Autocomplete, Place
// Details and Reverse Geocoding all produce the identical GeocodeSuggestion
// the client has always consumed.

export interface GeocodeSuggestion {
  id: string;
  /** Full human-readable line — what the dropdown row shows. */
  label: string;
  /** Street line only — what we drop into the address/street field. */
  address: string;
  city: string;
  state: string;
  /** ISO subdivision code when Google gives one, e.g. "LA". May be "" — the
   * client falls back to matching on the state name. */
  stateCode: string;
  country: string;
  /**
   * Empty on an autocomplete prediction: Google's Autocomplete returns no
   * geometry at all, by design. The client resolves them through
   * /api/geocode/details when a suggestion is actually picked, which is also
   * what makes a session token billable as one lookup instead of many.
   */
  latitude: string;
  longitude: string;
  /** Google place type, e.g. "street_address" | "premise" | "locality". */
  precision: string;
  /** Present on predictions; what /api/geocode/details takes. */
  placeId?: string;
}

export const GOOGLE_PLACES_AUTOCOMPLETE =
  "https://places.googleapis.com/v1/places:autocomplete";
export const GOOGLE_PLACE_DETAILS = "https://places.googleapis.com/v1/places";
export const GOOGLE_REVERSE_GEOCODE =
  "https://maps.googleapis.com/maps/api/geocode/json";

/** Shipbubble is Nigeria-only. Unfiltered, "Allen Avenue" returns Texas. */
export const REGION_CODES = ["ng"];

export const toFixed6 = (n: unknown): string => {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(6) : "";
};

/** Google returns Nigerian states as "Lagos" or "Lagos State"; the client
 *  matches against country-state-city, which only knows the bare form. */
export const normalizeStateName = (name?: string) =>
  (name || "").replace(/\s+state$/i, "").trim();

export const normalizeStateCode = (code?: string) =>
  (code || "").replace(/^NG-/i, "").toUpperCase();

/**
 * Address components come back the same shape from Place Details (camelCase)
 * and the Geocoding API (snake_case), so both are read here.
 */
interface Component {
  longText?: string;
  shortText?: string;
  long_name?: string;
  short_name?: string;
  types?: string[];
}

const pick = (
  components: Component[],
  types: string[],
  form: "long" | "short" = "long",
) => {
  for (const type of types) {
    const match = components.find((c) => c.types?.includes(type));
    if (!match) continue;
    const value =
      form === "short"
        ? (match.shortText ?? match.short_name)
        : (match.longText ?? match.long_name);
    if (value) return value;
  }
  return "";
};

/**
 * Builds a suggestion from a resolved place — used by both Place Details and
 * reverse geocoding, which is why it takes the pieces rather than a response.
 */
export const suggestionFromComponents = ({
  id,
  components,
  formattedAddress,
  latitude,
  longitude,
  precision,
}: {
  id: string;
  components: Component[];
  formattedAddress?: string;
  latitude: unknown;
  longitude: unknown;
  precision?: string;
}): GeocodeSuggestion => {
  const streetLine =
    [
      pick(components, ["street_number"]),
      pick(components, ["route"]),
    ]
      .filter(Boolean)
      .join(" ") ||
    pick(components, ["premise", "subpremise", "neighborhood"]) ||
    formattedAddress ||
    "";

  return {
    id,
    label: formattedAddress || streetLine,
    address: streetLine,
    // Google files Nigerian towns under any of these depending on size.
    city: pick(components, [
      "locality",
      "postal_town",
      "sublocality",
      "sublocality_level_1",
      "administrative_area_level_2",
    ]),
    state: normalizeStateName(
      pick(components, ["administrative_area_level_1"]),
    ),
    stateCode: normalizeStateCode(
      pick(components, ["administrative_area_level_1"], "short"),
    ),
    country: pick(components, ["country"]) || "Nigeria",
    latitude: toFixed6(latitude),
    longitude: toFixed6(longitude),
    precision: precision || "",
    placeId: id,
  };
};

/** Shared shape for "no key configured" — the client degrades to plain text. */
export const notConfigured = (message: string) => ({
  success: true as const,
  disabled: true as const,
  data: [] as GeocodeSuggestion[],
  message,
});
