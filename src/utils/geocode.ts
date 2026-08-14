import { City, State } from "country-state-city";

// Client-side helpers for the /api/geocode proxy, plus a zero-cost fallback.
//
// The coordinate resolution order used across the app:
//   1. coordinates the user picked from the autocomplete  (street-level)
//   2. coordinates already stored on the record            (customer address)
//   3. city centroid from country-state-city               (kilometre-level)
//   4. nothing — omit the fields entirely
//
// Step 3 matters more than it looks. Shipbubble uses coordinates for
// serviceability and zone/rate banding, not for the rider's last 50 metres —
// a town centroid answers both of those, and country-state-city already ships
// lat/long for every Nigerian state and city at no cost.

export interface GeocodeSuggestion {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  latitude: string;
  longitude: string;
  precision: string;
}

export interface Coordinates {
  latitude: string;
  longitude: string;
}

interface GeocodeResponse {
  success: boolean;
  data: GeocodeSuggestion[];
  disabled?: boolean;
  message?: string;
}

export const fetchAddressSuggestions = async (
  query: string,
  opts?: { limit?: number; proximity?: Coordinates | null },
): Promise<GeocodeResponse> => {
  const trimmed = (query || "").trim();
  if (trimmed.length < 3) return { success: true, data: [] };

  const url = new URL("/api/geocode", window.location.origin);
  url.searchParams.set("q", trimmed);
  if (opts?.limit) url.searchParams.set("limit", String(opts.limit));
  if (opts?.proximity?.latitude && opts?.proximity?.longitude) {
    url.searchParams.set(
      "proximity",
      `${opts.proximity.longitude},${opts.proximity.latitude}`,
    );
  }

  const response = await fetch(url.toString(), { method: "GET" });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      data: [],
      message: data?.message || "Address lookup failed",
    };
  }
  return data as GeocodeResponse;
};

/**
 * Turns a device GPS fix into a readable address. Returns null when the
 * provider has nothing at those coordinates, when geocoding is unconfigured,
 * or on any failure — callers treat a null as "let the merchant type it",
 * never as an error worth interrupting them with.
 */
export const fetchAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<GeocodeSuggestion | null> => {
  const url = new URL("/api/geocode/reverse", window.location.origin);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  try {
    const response = await fetch(url.toString(), { method: "GET" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return null;
    return (data?.data?.[0] as GeocodeSuggestion) ?? null;
  } catch {
    return null;
  }
};

// ─── Fallback: city / state centroid ────────────────────────────────────────

const toFixed6 = (v: unknown): string => {
  const num = Number(v);
  return Number.isFinite(num) ? num.toFixed(6) : "";
};

const asCoordinates = (
  latitude: unknown,
  longitude: unknown,
): Coordinates | null => {
  const lat = toFixed6(latitude);
  const lng = toFixed6(longitude);
  // Both or neither — a half-populated pair is worse than none, since the
  // backend treats latitude/longitude as an optional pair, not nullable fields.
  return lat && lng ? { latitude: lat, longitude: lng } : null;
};

/**
 * Centroid for a Nigerian city, falling back to the state's own centroid.
 * `stateIso` is the country-state-city ISO code (e.g. "LA"), which is what the
 * order-delivery form holds; the Shipbubble settings form holds the full state
 * name instead, so use `centroidByStateName` there.
 */
export const cityCentroid = (
  stateIso?: string | null,
  cityName?: string | null,
): Coordinates | null => {
  if (!stateIso) return null;

  if (cityName) {
    const match = City.getCitiesOfState("NG", stateIso).find(
      (c) => c.name.toLowerCase() === cityName.trim().toLowerCase(),
    );
    const coords = asCoordinates(match?.latitude, match?.longitude);
    if (coords) return coords;
  }

  const state = State.getStateByCodeAndCountry(stateIso, "NG");
  return asCoordinates(state?.latitude, state?.longitude);
};

/** Same as `cityCentroid` but keyed on the full state name ("Lagos"). */
export const centroidByStateName = (
  stateName?: string | null,
  cityName?: string | null,
): Coordinates | null => {
  if (!stateName) return null;
  const state = State.getStatesOfCountry("NG").find(
    (s) => s.name.toLowerCase() === stateName.trim().toLowerCase(),
  );
  if (!state) return null;
  return cityCentroid(state.isoCode, cityName);
};

/**
 * Picks the best coordinates available, in resolution order. Returns null when
 * nothing resolves — callers omit the fields entirely in that case rather than
 * sending nulls (the API models them as optional, not nullable).
 */
export const resolveCoordinates = (
  picked?: Partial<Coordinates> | null,
  fallback?: Coordinates | null,
): Coordinates | null =>
  asCoordinates(picked?.latitude, picked?.longitude) || fallback || null;

/** Spreads into a request body: `{...coordinatesPayload(coords)}`. */
export const coordinatesPayload = (coords?: Coordinates | null) =>
  coords ? { latitude: coords.latitude, longitude: coords.longitude } : {};
