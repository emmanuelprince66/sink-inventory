// Geoapify address lookup — the provider behind /api/address* by default.
//
// Chosen over Google for the same reason it was used originally: the free tier
// needs no card, and it returns coordinates inline on every prediction, so a
// pick needs no second billed call to resolve geometry. Google is wired up
// alongside it and is one env var away — see addressContract.ts.
//
// Everything here maps Geoapify's GeoJSON onto the shared AddressSuggestion,
// so no caller can tell which provider answered.

import {
  normalizeStateCode,
  normalizeStateName,
  toFixed6,
  type AddressSuggestion,
} from "./addressContract";

export const GEOAPIFY_AUTOCOMPLETE =
  "https://api.geoapify.com/v1/geocode/autocomplete";
export const GEOAPIFY_REVERSE = "https://api.geoapify.com/v1/geocode/reverse";

/** Geoapify's filter/bias syntax for "Nigeria only". */
export const COUNTRY_FILTER = "countrycode:ng";

/**
 * Geoapify splits a street line across housenumber/street, and classifies
 * Nigerian towns under city, town, village or suburb depending on size — so
 * both are read with fallbacks rather than from one field.
 */
const streetLine = (p: any) =>
  [p.housenumber, p.street].filter(Boolean).join(" ") ||
  p.address_line1 ||
  p.name ||
  "";

const cityOf = (p: any) => p.city || p.town || p.village || p.suburb || "";

/**
 * One GeoJSON feature → one suggestion.
 *
 * Returns null when the feature carries no coordinates: a suggestion without
 * them is useless here, since coordinates are the whole reason for the lookup.
 */
export const suggestionFromFeature = (
  feature: any,
  index: number,
): AddressSuggestion | null => {
  const p = feature?.properties || {};

  const latitude = toFixed6(p.lat ?? feature?.geometry?.coordinates?.[1]);
  const longitude = toFixed6(p.lon ?? feature?.geometry?.coordinates?.[0]);
  if (!latitude || !longitude) return null;

  const street = streetLine(p);

  return {
    id: String(p.place_id || feature?.id || index),
    label: p.formatted || street,
    address: street,
    city: cityOf(p),
    state: normalizeStateName(p.state),
    stateCode: normalizeStateCode(p.state_code),
    country: p.country || "Nigeria",
    latitude,
    longitude,
    precision: p.result_type || "",
    // No placeId: coordinates are already here, so AddressAutocomplete skips
    // the /api/address/details round trip entirely.
  };
};

/**
 * Reverse lookup → one suggestion.
 *
 * The coordinates echoed back are the ones asked for, not the provider's
 * snapped centroid: the device's own fix is more precise than the address it
 * matched to.
 */
export const suggestionFromReverse = (
  feature: any,
  lat: string,
  lon: string,
): AddressSuggestion => {
  const p = feature?.properties || {};
  const street = streetLine(p);

  return {
    id: String(p.place_id || feature?.id || "reverse"),
    label: p.formatted || street,
    address: street,
    city: cityOf(p),
    state: normalizeStateName(p.state),
    stateCode: normalizeStateCode(p.state_code),
    country: p.country || "Nigeria",
    latitude: toFixed6(lat),
    longitude: toFixed6(lon),
    precision: p.result_type || "",
  };
};

/** Geoapify reports failures in `message`; some endpoints use `error`. */
export const geoapifyError = (data: any, fallback: string) =>
  data?.message || data?.error || fallback;
