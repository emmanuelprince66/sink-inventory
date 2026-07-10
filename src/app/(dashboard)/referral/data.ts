// Status mapping for the Referral feature.
// The API returns human-readable status strings ("Active Subscriber",
// "Not Subscribed", "Lapsed"). This module normalises them to a small enum
// so the UI can pick a pill style without caring about exact wording.

export type ReferralStatus = "active" | "not-subscribed" | "lapsed";

export const STATUS_META: Record<
  ReferralStatus,
  { label: string; pillClass: string; dotClass: string }
> = {
  active: {
    label: "Active Subscriber",
    pillClass: "bg-success-2 text-success-1",
    dotClass: "bg-success-1",
  },
  "not-subscribed": {
    label: "Not Subscribed",
    pillClass: "bg-warning-2 text-warning-1",
    dotClass: "bg-warning-1",
  },
  lapsed: {
    label: "Lapsed",
    pillClass: "bg-grey-6 text-grey-3",
    dotClass: "bg-grey-4",
  },
};

// Normalise the free-text status the backend returns into a known key.
// Defaults to "not-subscribed" — safer than guessing "active" when in doubt.
export const normaliseReferralStatus = (raw: string | undefined): ReferralStatus => {
  if (!raw) return "not-subscribed";
  const key = raw.trim().toLowerCase();
  if (key.includes("active") || key.includes("subscribed") && !key.includes("not"))
    return "active";
  if (key.includes("laps")) return "lapsed";
  return "not-subscribed";
};

// Build the share link a merchant gives out. Uses window.location.origin so
// it points to whatever environment the dashboard is currently running on.
export const buildReferralLink = (code: string): string => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/signup?referal=${encodeURIComponent(code)}`;
};
