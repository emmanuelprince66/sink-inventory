export type StoreChannel = "INSTORE" | "OUTSTORE";

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
  if (customDomainApproved && customDomain) {
    const domain = customDomain
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");
    return `https://${domain}/${channel === "INSTORE" ? "in" : "out"}`;
  }

  const channelPath = channel === "INSTORE" ? "i" : "o";
  return `https://store.sync360.africa/${channelPath}/${storeSlug || ""}`;
};
