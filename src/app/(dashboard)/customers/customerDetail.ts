// Shape of GET /customer/{id}/ — the profile screen's single source.
// Note the top-level sections carry the real figures; the nested `data` block
// is the same row the list returns and can lag (its sales_count/total_sales
// come back 0 for customers whose purchase_behaviour shows orders), so the
// profile reads from purchase_behaviour and financial_details instead.
import type { CustomerType } from "./types";

export interface CustomerIdentity {
  name: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  /** Pre-formatted, e.g. "Aug 2026". */
  customer_since: string | null;
  state: string | null;
  city: string | null;
  /**
   * Segment membership, sent here and repeated on the nested `data` row.
   * `segment` is the one to lead with, `segment_type` its enum (what the
   * palette keys off), and `segments` the full set — the rules can match a
   * customer several times over.
   */
  segment?: string | null;
  segment_type?: string | null;
  segments?: Array<{ id?: string; name: string; segment_type?: string }>;
}

/** ISO timestamps; null until the milestone happens. */
export interface CustomerJourney {
  customer_registered: string | null;
  first_purchase: string | null;
  joined_loyalty: string | null;
  reward_earned: string | null;
  latest_purchase: string | null;
}

export interface PurchaseBehaviour {
  first_purchase_date: string | null;
  last_purchase_date: string | null;
  total_orders: number;
  total_spend: number;
  average_basket_size: number;
  lifetime_value: number;
  favourite_category: string | null;
  favourite_product: string | null;
  preferred_payment: string | null;
  retention_score: number;
}

export interface LoyaltyRewards {
  loyalty_tier: string | null;
  reward_points: number;
  reward_balance: number;
  cashback_earned: number;
  referral_count: number;
  streak: number | null;
  coupons_redeemed: number;
  streak_progress: number | null;
}

export interface EngagementMetrics {
  coupons_redeemed: number;
  churn_risk: string | null;
  retention_score: number;
  current_streak: number | null;
}

export interface ShoppingBehaviour {
  visit_frequency: string | null;
  purchase_frequency: string | null;
  shopping_time: string | null;
  shopping_day: string | null;
  preferred_payment: string | null;
}

export interface FinancialDetails {
  wallet_balance: number;
  credit_balance: number;
  outstanding_balance: number;
  total_lifetime_spend: number;
  avg_basket_size: number;
  total_orders: number;
  cashback_earned: number;
}

export interface CustomerDetail {
  identity: CustomerIdentity;
  customer_journey: CustomerJourney;
  purchase_behaviour: PurchaseBehaviour;
  loyalty_rewards: LoyaltyRewards;
  engagement_metrics: EngagementMetrics;
  shopping_behaviour: ShoppingBehaviour;
  financial_details: FinancialDetails;
  /** Generated summary sentence, ready to render. */
  ai_customer_insight: string | null;
  data: CustomerType;
}
