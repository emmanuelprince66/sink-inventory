/**
 * Branch-level subscriptions.
 *
 * Only the founding branch (the owner's first business) rides on the owner's
 * account-level plan. Every branch created after it is billed on its own and
 * stays locked — attendants, uploads, customers, campaigns, bookings and a
 * custom domain are all refused — until it has a plan of its own.
 *
 * The checks are strict on `is_founding === false` so a payload from before
 * the backend added these fields never reads as locked.
 */

export interface BranchSubscriptionFields {
  id?: string;
  name?: string;
  is_founding?: boolean;
  is_subscribed?: boolean;
  subscription?: string | null;
  subscription_date?: string | null;
  subscription_end_date?: string | null;
}

/** Billed separately from the owner's account plan. */
export const isSeparatelyBilled = (business?: BranchSubscriptionFields | null) =>
  business?.is_founding === false;

/** A non-founding branch with no active plan of its own. */
export const isBranchLocked = (business?: BranchSubscriptionFields | null) =>
  isSeparatelyBilled(business) && !business?.is_subscribed;

/**
 * The id to send as `business_id` on subscribe / active_plan, or null for the
 * founding branch — the backend reads it as the account plan either way, and
 * leaving it out keeps the request exactly as it was before branches.
 */
export const planBusinessIdFor = (business?: BranchSubscriptionFields | null) =>
  isSeparatelyBilled(business) && business?.id ? business.id : null;

/** Where to send someone to subscribe this branch. */
export const subscribeHrefFor = (business?: BranchSubscriptionFields | null) => {
  const id = planBusinessIdFor(business);
  return id ? `/plan?business_id=${encodeURIComponent(id)}` : "/plan";
};
