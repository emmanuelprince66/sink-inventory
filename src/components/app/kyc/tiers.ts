/**
 * KYC tiers and the transaction limits they unlock.
 *
 * One source of truth on purpose: these figures were previously written out by
 * hand in three places and had drifted badly — the individual tiers were being
 * advertised at ₦5M / ₦10M / ₦50M when the real limits are ₦50K / ₦200K / ₦5M,
 * overstating Tier 1 by a hundredfold. A merchant reading that would plan
 * around money the account cannot move.
 */

export interface KycTier {
  tier: number;
  title: string;
  /** What has to be supplied to reach this tier. */
  requirement: string;
  /** Daily / single transaction limit, formatted for display. */
  limit: string;
  description: string;
}

export const INDIVIDUAL_TIERS: KycTier[] = [
  {
    tier: 1,
    title: "Tier 1: Basic Verification",
    requirement: "BVN or NIN",
    limit: "₦50,000",
    description: "Either identity number is enough to start.",
  },
  {
    tier: 2,
    title: "Tier 2: Enhanced Verification",
    requirement: "BVN + NIN",
    limit: "₦200,000",
    description: "Both identity numbers on file.",
  },
  {
    tier: 3,
    title: "Tier 3: Full Verification",
    requirement: "BVN + NIN + Residential Address",
    limit: "₦5,000,000",
    description: "Adds a verified residential address.",
  },
];

export const CORPORATE_TIERS: KycTier[] = [
  {
    tier: 1,
    title: "Tier 1: Business Information",
    requirement: "Director & business details",
    limit: "₦100,000",
    description: "Director & business details",
  },
  {
    tier: 2,
    title: "Tier 2: Document Verification",
    requirement:
      "Certificate, memorandum, statutory report, director ID, utility bill & company proof of address",
    limit: "₦5,000,000",
    description: "CAC, memorandum, utility bill & more",
  },
];

/** "₦50,000 daily" — the limits are per day as well as per transaction. */
export const dailyLimit = (tier: KycTier) => `${tier.limit} daily`;
