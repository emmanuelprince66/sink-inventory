import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

// ─── Dashboard ──────────────────────────────────────────────────────────────
// GET /referral/dashboard/ — overview for the logged-in user.

export interface ReferralTrackingRow {
  business_id: string;
  business_name: string;
  status: string;
  pending: number;
  unlocked: number;
  expires_days: number;
}

export interface ReferralDashboardSummary {
  total_referrals: number;
  pending_rewards: number;
  total_paid_commission: number;
  available_balance: number;
}

export interface ReferralDashboard {
  code: string;
  summary: ReferralDashboardSummary;
  tracking_table: ReferralTrackingRow[];
}

interface DashboardResponse {
  success: boolean;
  data: ReferralDashboard;
  message: string;
}

const fetchReferralDashboard = async (): Promise<DashboardResponse> => {
  const response = await fetch("/api/referral/dashboard", { method: "GET" });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch referral dashboard");
  }
  return response.json();
};

type DashboardFn = typeof fetchReferralDashboard;

export const useReferralDashboardQuery = (
  config?: QueryConfigType<DashboardFn>,
) =>
  useQuery<ExtractFnReturnType<DashboardFn>>({
    queryKey: [queryKey.referral.getDashboard],
    queryFn: fetchReferralDashboard,
    staleTime: 1000 * 60, // 1 min — totals don't need to be aggressively fresh
    ...config,
  });

// ─── Business detail ───────────────────────────────────────────────────────
// GET /referral/business/{business_id}/

export interface ReferralActivityEntry {
  date?: string;
  subscription?: number;
  reward?: number;
  // Backend may return additional or differently-named fields — pass through.
  [key: string]: unknown;
}

export interface ReferralRewardAllocation {
  total_reward: number;
  unlocked: number;
  pending: number;
  percentage_earned: number;
}

export interface ReferralBusinessDetail {
  business_name: string;
  status: string;
  days_remaining: number;
  reward_allocation: ReferralRewardAllocation;
  recent_activity: ReferralActivityEntry[];
}

interface BusinessDetailResponse {
  success: boolean;
  data: ReferralBusinessDetail;
  message: string;
}

const fetchReferralBusiness = async (
  businessId: string,
): Promise<BusinessDetailResponse> => {
  const response = await fetch(`/api/referral/business/${businessId}`, {
    method: "GET",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch referral details");
  }
  return response.json();
};

type BusinessDetailFn = typeof fetchReferralBusiness;

export const useReferralBusinessQuery = (
  businessId: string,
  config?: QueryConfigType<BusinessDetailFn>,
) =>
  useQuery<ExtractFnReturnType<BusinessDetailFn>>({
    queryKey: [queryKey.referral.getBusiness, businessId],
    queryFn: () => fetchReferralBusiness(businessId),
    enabled: Boolean(businessId),
    staleTime: 1000 * 60,
    ...config,
  });
