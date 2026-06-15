// UI-only mock data for the Referral feature.
// Swap these constants and the `getReferralBusiness` helper with a real
// query (e.g. useReferralsQuery) when the backend endpoint ships.

export type ReferralStatus =
  | "active"
  | "not-subscribed"
  | "lapsed";

export interface ReferralActivity {
  date: string; // YYYY-MM-DD
  subscription: number;
  reward: number;
}

export interface ReferralBusiness {
  id: string;
  name: string;
  status: ReferralStatus;
  totalReward: number;
  unlocked: number;
  pending: number;
  /** Number of days remaining before the referral window closes. */
  expiresInDays: number;
  activity: ReferralActivity[];
}

export interface ReferralSummary {
  totalReferrals: number;
  pendingRewards: number;
  totalPaidCommission: number;
  availableBalance: number;
  pendingBalance: number;
  referralCode: string;
  referralLink: string;
}

export const REFERRAL_SUMMARY: ReferralSummary = {
  totalReferrals: 15,
  pendingRewards: 120_000,
  totalPaidCommission: 35_000,
  availableBalance: 35_000,
  pendingBalance: 120_000,
  referralCode: "Tobi123",
  referralLink: "https://sync360.com/r/Tobi123",
};

export const REFERRAL_BUSINESSES: ReferralBusiness[] = [
  {
    id: "abc-store",
    name: "ABC Store",
    status: "active",
    totalReward: 20_000,
    unlocked: 2_000,
    pending: 18_000,
    expiresInDays: 170,
    activity: [
      { date: "2026-06-02", subscription: 5_000, reward: 1_000 },
      { date: "2026-07-02", subscription: 5_000, reward: 1_000 },
    ],
  },
  {
    id: "fresh-mart",
    name: "Fresh Mart",
    status: "active",
    totalReward: 20_000,
    unlocked: 8_000,
    pending: 12_000,
    expiresInDays: 145,
    activity: [
      { date: "2026-04-18", subscription: 5_000, reward: 2_000 },
      { date: "2026-05-18", subscription: 5_000, reward: 2_000 },
      { date: "2026-06-18", subscription: 5_000, reward: 2_000 },
      { date: "2026-07-18", subscription: 5_000, reward: 2_000 },
    ],
  },
  {
    id: "dee-pharmacy",
    name: "Dee Pharmacy",
    status: "not-subscribed",
    totalReward: 20_000,
    unlocked: 0,
    pending: 20_000,
    expiresInDays: 178,
    activity: [],
  },
  {
    id: "kano-bakery",
    name: "Kano Bakery",
    status: "active",
    totalReward: 20_000,
    unlocked: 4_000,
    pending: 16_000,
    expiresInDays: 132,
    activity: [
      { date: "2026-05-10", subscription: 5_000, reward: 2_000 },
      { date: "2026-06-10", subscription: 5_000, reward: 2_000 },
    ],
  },
  {
    id: "lagos-mini-mart",
    name: "Lagos Mini Mart",
    status: "lapsed",
    totalReward: 20_000,
    unlocked: 6_000,
    pending: 0,
    expiresInDays: 0,
    activity: [
      { date: "2026-01-08", subscription: 5_000, reward: 3_000 },
      { date: "2026-02-08", subscription: 5_000, reward: 3_000 },
    ],
  },
];

export const getReferralBusiness = (
  id: string,
): ReferralBusiness | undefined =>
  REFERRAL_BUSINESSES.find((b) => b.id === id);

export const STATUS_META: Record<
  ReferralStatus,
  { label: string; pillClass: string; dotClass: string }
> = {
  active: {
    label: "Active Subscriber",
    pillClass: "bg-green-50 text-green-700 border border-green-100",
    dotClass: "bg-green-500",
  },
  "not-subscribed": {
    label: "Not Subscribed",
    pillClass: "bg-amber-50 text-amber-700 border border-amber-100",
    dotClass: "bg-amber-500",
  },
  lapsed: {
    label: "Lapsed",
    pillClass: "bg-slate-50 text-slate-600 border border-slate-200",
    dotClass: "bg-slate-400",
  },
};
