/**
 * The public landing page for a loyalty campaign — what a customer's phone
 * opens when it scans the card.
 *
 * The token itself contains a colon ("<program_id>:<signature>"), which is a
 * legal path character, so it goes in raw and unencoded — that is exactly the
 * form the join route and the public campaign lookup expect.
 */

const CANONICAL_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://business.sync360.africa";

const isLocal = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);

/**
 * Origin for a link that leaves the browser — a QR someone scans on a phone,
 * or a card that gets printed. Never localhost: a customer's phone cannot
 * resolve the dev server, and a printed card outlives the session that made it.
 */
export const publicOrigin = () => {
  if (typeof window === "undefined") return CANONICAL_ORIGIN;
  const origin = window.location.origin;
  return isLocal(origin) ? CANONICAL_ORIGIN : origin;
};

/** Join URL for a QR, a printed card, or a link handed to a customer. */
export const loyaltyJoinUrl = (token: string) =>
  `${publicOrigin()}/loyalty/join/${token}`;

/**
 * Join URL for opening in this browser — keeps the dev origin so "Preview" and
 * "Landing Page" still work against a local server.
 */
export const loyaltyJoinUrlForThisBrowser = (token: string) =>
  `${typeof window === "undefined" ? CANONICAL_ORIGIN : window.location.origin}/loyalty/join/${token}`;
