import { State } from "country-state-city";
import {
  normalizeStateCode,
  normalizeStateName,
  toFixed6,
  type AddressSuggestion,
} from "./addressContract";

// Shared shaping for the Google Places / Geocoding responses behind
// /api/address. Keeping it out of the route files means Autocomplete, Place
// Details and Reverse Geocoding all produce the identical AddressSuggestion
// the client has always consumed.

// The suggestion shape and the small normalisers are shared with Geoapify —
// see addressContract.ts. Re-exported here so the route files that already
// import them from this module keep working.
export {
  normalizeStateCode,
  normalizeStateName,
  notConfigured,
  REGION_CODES,
  toFixed6,
  type AddressSuggestion,
} from "./addressContract";

export const GOOGLE_PLACES_AUTOCOMPLETE =
  "https://places.googleapis.com/v1/places:autocomplete";
export const GOOGLE_PLACE_DETAILS = "https://places.googleapis.com/v1/places";
// Geocoding API, not Places — /maps/api/geocode/json. This read
// /maps/api/address/json, which is not an endpoint Google serves, so reverse
// lookup could never have worked no matter which APIs were enabled.
export const GOOGLE_REVERSE_GEOCODE =
  "https://maps.googleapis.com/maps/api/geocode/json";

/**
 * Google's subdivision codes are not country-state-city's: Oyo is "YO" to
 * Google and "OY" to the library, so matching on the code alone silently
 * failed and only the state-name fallback saved it. Resolving the name against
 * the library here means the client always receives a code it can actually use,
 * and the name fallback goes back to being a backstop rather than the load path.
 */
const stateCodeFromName = (name: string) => {
  if (!name) return "";
  const match = State.getStatesOfCountry("NG").find(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
  return match?.isoCode ?? "";
};

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
  /**
   * The place's own name — "Eko Atlantic City View Point". It is NOT in
   * addressComponents: those describe the postal address of the plot, so an
   * establishment resolves to the street it sits on and the name disappears.
   * Picking a landmark and being shown "Bishop Oluwole Street" instead is
   * exactly that, and for a delivery address the landmark is the useful half.
   */
  name,
  latitude,
  longitude,
  precision,
}: {
  id: string;
  components: Component[];
  formattedAddress?: string;
  name?: string;
  latitude: unknown;
  longitude: unknown;
  precision?: string;
}): AddressSuggestion => {
  // The street line only — never the formatted address. Google's
  // formattedAddress is "Lekki Phase 1, Lekki 106104, Lagos, Nigeria", and
  // dropping that into the street field repeats the city, state and country
  // that the selects underneath it already hold, then sends the lot to the
  // backend as one blob. Falls back through progressively wider components so
  // a locality pick still yields "Ikeja" rather than nothing.
  const streetPart =
    [pick(components, ["street_number"]), pick(components, ["route"])]
      .filter(Boolean)
      .join(" ") ||
    pick(components, [
      "premise",
      "subpremise",
      "neighborhood",
      "sublocality_level_1",
      "sublocality",
      "locality",
    ]) ||
    // Last resort: the narrowest component Google returned, whatever it is.
    (components[0]?.longText ?? components[0]?.long_name ?? "");

  const placeName = (name || "").trim();
  const stateName = normalizeStateName(
    pick(components, ["administrative_area_level_1"]),
  );

  // Name first, then the street it is on — "Eko Atlantic City View Point,
  // Bishop Oluwole Street". A rider needs both: the landmark to find it and
  // the street to get there. Skipped when the name IS the street, or when the
  // street line already opens with it, so nothing repeats itself.
  const streetLine =
    placeName &&
    placeName.toLowerCase() !== streetPart.toLowerCase() &&
    !streetPart.toLowerCase().startsWith(placeName.toLowerCase())
      ? [placeName, streetPart].filter(Boolean).join(", ")
      : streetPart || placeName;

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
    state: stateName,
    stateCode:
      stateCodeFromName(stateName) ||
      normalizeStateCode(pick(components, ["administrative_area_level_1"], "short")),
    country: pick(components, ["country"]) || "Nigeria",
    latitude: toFixed6(latitude),
    longitude: toFixed6(longitude),
    precision: precision || "",
    placeId: id,
  };
};

/** Shared shape for "no key configured" — the client degrades to plain text. */
// ─── Legacy fallback ────────────────────────────────────────────────────────
//
// Places API (New) is the target, but a project that has only the legacy
// Places API enabled would otherwise return nothing at all. Rather than making
// the choice a config flag someone has to remember to flip, each route tries
// the new API first and falls back only on the specific "service disabled"
// error — so enabling Places API (New) in the console upgrades the app with no
// code change, and nothing else silently routes to the deprecated surface.
//
// There is no legacy equivalent for reverse geocoding: that one needs the
// Geocoding API enabled, and degrades to "type it yourself" until it is.

export const LEGACY_AUTOCOMPLETE =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
export const LEGACY_DETAILS =
  "https://maps.googleapis.com/maps/api/place/details/json";

/** True only for "this API is switched off", not for quota, auth or bad input. */
export const isServiceDisabled = (status: number, data: any) =>
  status === 403 &&
  (data?.error?.status === "PERMISSION_DENIED" ||
    data?.error?.details?.some?.(
      (d: any) => d?.reason === "SERVICE_DISABLED",
    )) &&
  /has not been used in project|is disabled/i.test(data?.error?.message || "");

/** Legacy prediction → the same shape the new API's predictions map to. */
export const suggestionFromLegacyPrediction = (
  prediction: any,
): AddressSuggestion | null => {
  if (!prediction?.place_id) return null;
  const main = prediction.structured_formatting?.main_text || "";
  const secondary = prediction.structured_formatting?.secondary_text || "";

  return {
    id: prediction.place_id,
    placeId: prediction.place_id,
    label: prediction.description || [main, secondary].filter(Boolean).join(", "),
    address: main,
    secondary,
    city: "",
    state: "",
    stateCode: "",
    country: "Nigeria",
    // Resolved on select, exactly as with the new API.
    latitude: "",
    longitude: "",
    precision: prediction.types?.[0] || "",
  };
};
