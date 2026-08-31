// The shape every address provider answers in, and the switch that picks one.
//
// Two providers are wired up behind /api/address*: Geoapify (free tier, no
// card) and Google Places. Both map their own response onto the
// AddressSuggestion below, so the client — AddressAutocomplete, the customer,
// order-delivery and Shipbubble hooks — cannot tell them apart.
//
// Switching is one environment variable, no code change:
//
//   ADDRESS_PROVIDER=geoapify   (default) needs GEOAPIFY_KEY
//   ADDRESS_PROVIDER=google               needs GOOGLE_MAPS_API_KEY + billing
//
// Google is the better data source for Nigerian street addresses, but its APIs
// refuse every call until a billing account with a live card is attached to the
// project. Geoapify's free tier needs no card, so it is the default until that
// billing is sorted.

export type AddressProvider = "geoapify" | "google";

/**
 * Which provider serves address lookups.
 *
 * Anything other than an explicit "google" resolves to Geoapify, so a typo in
 * the variable degrades to the provider that works without billing rather than
 * to the one that 403s.
 */
export const activeProvider = (): AddressProvider =>
  process.env.ADDRESS_PROVIDER?.trim().toLowerCase() === "google"
    ? "google"
    : "geoapify";

export interface AddressSuggestion {
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
  /**
   * Geoapify returns these inline on every prediction. Google does not: its
   * Autocomplete carries no geometry at all, so a Google prediction arrives
   * with these empty and a placeId set, and the client resolves the pick
   * through /api/address/details. AddressAutocomplete skips that round trip
   * whenever coordinates are already present, which is what lets one client
   * serve both providers.
   */
  latitude: string;
  longitude: string;
  /** Provider's own precision hint — Geoapify result_type, Google place type. */
  precision: string;
  /** Google only; absent on Geoapify, which needs no second call. */
  placeId?: string;
  /** Prediction's second line — "Kuola - Aba Paanu Road, Ibadan, Nigeria". */
  secondary?: string;
}

/** Shipbubble is Nigeria-only. Unfiltered, "Allen Avenue" returns Texas. */
export const REGION_CODES = ["ng"];

export const toFixed6 = (n: unknown): string => {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(6) : "";
};

/** Providers return Nigerian states as "Lagos" or "Lagos State"; the client
 *  matches against country-state-city, which only knows the bare form. */
export const normalizeStateName = (name?: string) =>
  (name || "").replace(/\s+state$/i, "").trim();

export const normalizeStateCode = (code?: string) =>
  (code || "").replace(/^NG-/i, "").toUpperCase();

/**
 * No key configured. Reported as success + disabled rather than an error, so
 * AddressAutocomplete degrades to a plain text input and the forms keep
 * working instead of showing a failure the merchant cannot act on.
 */
export const notConfigured = (message: string) => ({
  success: true,
  disabled: true,
  data: [] as AddressSuggestion[],
  message,
});
