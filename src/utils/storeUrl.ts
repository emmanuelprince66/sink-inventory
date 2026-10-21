export type StoreChannel = "INSTORE" | "OUTSTORE";

const PLATFORM_STORE_ORIGIN = "https://store.sync360.africa";

const normalizeDomain = (customDomain: string) =>
  customDomain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");

export const getStoreUrl = ({
  channel,
  storeSlug,
  customDomain,
  customDomainApproved,
}: {
  channel: StoreChannel;
  storeSlug?: string | null;
  customDomain?: string | null;
  customDomainApproved?: boolean;
}) => {
  if (customDomainApproved && customDomain?.trim()) {
    return `https://${normalizeDomain(customDomain)}/${channel === "INSTORE" ? "in" : "out"}`;
  }

  const channelPath = channel === "INSTORE" ? "i" : "o";
  return `${PLATFORM_STORE_ORIGIN}/${channelPath}/${storeSlug || ""}`;
};

// First path segments the storefront router already owns. A store whose slug
// is one of these can't use /<slug>/services, so it gets the legacy link.
const RESERVED_STOREFRONT_SEGMENTS = new Set([
  "i",
  "o",
  "in",
  "out",
  "services",
  "bookings",
]);

/**
 * Public booking page customers can be sent to.
 * - Approved custom domain: https://<domain>/services
 * - Otherwise:              https://store.sync360.africa/<slug>/services
 * Returns null when the business has neither.
 */
export const getServicesUrl = ({
  storeSlug,
  customDomain,
  customDomainApproved,
}: {
  storeSlug?: string | null;
  customDomain?: string | null;
  customDomainApproved?: boolean;
}): string | null => {
  if (customDomainApproved && customDomain?.trim()) {
    return `https://${normalizeDomain(customDomain)}/services`;
  }

  const slug = storeSlug?.trim();
  if (!slug) return null;

  const encoded = encodeURIComponent(slug);
  return RESERVED_STOREFRONT_SEGMENTS.has(slug.toLowerCase())
    ? `${PLATFORM_STORE_ORIGIN}/o/${encoded}/services`
    : `${PLATFORM_STORE_ORIGIN}/${encoded}/services`;
};
