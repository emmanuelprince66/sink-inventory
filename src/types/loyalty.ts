// Auto-generated from the Sync360 OpenAPI spec (swagger 2.0).
// Source: https://staging-api.sync360.africa/?format=openapi
// Regenerate rather than editing by hand.

export interface BusinessCustomerLoyaltyOverview {
  id?: string;
  name: string;
  phone?: string | null;
  loyalty_code?: string;
  tier_name?: string;
  total_spend?: string;
  progress_visits?: string;
  progress_target?: string;
}

export interface ConsolidatedCustomerCharts {
  customer_retention: CustomerRetentionChartPoint[];
  new_vs_returning: NewVsReturningChartPoint[];
  total_customer_growth: TotalCustomerGrowthChart;
}

export interface CustomerAnalyticsOverview {
  selected_month: string;
  total_customers: MetricPercentage;
  active_customers: MetricPercentage;
  new_this_month: MetricPercentage;
  returning_customers: MetricPercentage;
  retention_rate: MetricPoint;
  churn_rate: MetricPoint;
  avg_lifetime_value: MetricPercentage;
  loyalty_members: MetricPercentage;
  repeat_purchase_rate: MetricPoint;
  avg_visit_frequency: MetricFrequency;
  avg_order_value: MetricPercentage;
  revenue_per_customer: MetricPercentage;
}

export interface CustomerRetentionChartPoint {
  month: string;
  retention_rate: number;
}

export interface GrowthChartPoint {
  month: string;
  total_customers: number;
}

export interface LoyaltyBonusPeriod {
  id?: string;
  name: string;
  multiplier: string;
  days_of_week?: ("MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY")[];
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export interface LoyaltyCampaignCostBreakdown {
  program_id: string;
  program_name: string;
  trigger_summary: string;
  reward_summary: string;
  total_sent: string;
  total_redeemed: string;
  cancelled: string;
  retention_rate: number;
}

export interface LoyaltyCondition {
  id?: string;
  type: "VISIT" | "SPEND" | "QUANTITY" | "PRODUCT" | "CATEGORY" | "STREAK" | "REFERRAL" | "BIRTHDAY";
  threshold?: string | null;
  min_spend_per_visit?: string | null;
  product?: string | null;
  category?: string | null;
  streak_interval?: "DAILY" | "WEEKLY" | "MONTHLY" | null;
}

export interface LoyaltyDashboard {
  total_participants: number;
  total_rewarded: string;
  total_completions: number;
  top_streak_performers: TopStreakPerformer[];
  members: number;
  active_members: number;
  rewards_issued: number;
  rewards_redeemed: number;
  rewards_pending: number;
  redemption_rate: number;
  average_spend: string;
  average_visits: number;
  returning_customer_rate: number;
  campaign_revenue: string;
}

export interface LoyaltyEnrollment {
  id?: string;
  loyalty_code?: string;
  program_name?: string;
  member_name?: string;
  tier_name?: string;
  status?: "ACTIVE" | "PAUSED" | "EXPIRED";
  visit_count?: number;
  spend_total?: string;
  current_streak?: number;
  longest_streak?: number;
  completions_count?: number;
  progress_display?: string;
  status_label?: string;
  reward_description?: string;
  remaining_message?: string;
  milestone_steps?: string;
  joined_at?: string;
}

export interface LoyaltyJoin {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  birthday?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  referral_code?: string;
  address?: string;
}

export interface LoyaltyMember {
  id?: string;
  name?: string;
  phone?: string;
  referral_code?: string;
  tier_name?: string;
  total_visits?: number;
  total_spend?: string;
  birthday?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  joined_at?: string;
}

export interface LoyaltyMilestone {
  id?: string;
  name?: string | null;
  /** After X visits or milestone count */
  trigger_count: number;
  reward_type: "POINTS" | "WALLET_CREDIT" | "PERCENTAGE" | "FREE_ITEM" | "FREE_SERVICE";
  reward_value?: string | null;
  reward_product?: string | null;
  reward_service?: string | null;
  reward_description?: string | null;
  created_at?: string;
}

export interface LoyaltyParticipantProgress {
  id: string;
  member_id: string;
  name: string;
  joined_at: string;
  last_qualifying_visit_at: string | null;
  status: string;
  progress_current: number;
  progress_target: number | null;
}

export interface LoyaltyProgram {
  id?: string;
  name: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED";
  reward_type: "POINTS" | "WALLET_CREDIT" | "PERCENTAGE" | "FREE_ITEM" | "FREE_SERVICE";
  reward_value?: string | null;
  reward_product?: string | null;
  reward_service?: string | null;
  reward_description?: string | null;
  reward_style?: "CONTINUOUS" | "ONE_TIME";
  visit_window_hours?: number;
  completion_window_days?: number | null;
  timeout_action?: "RESTART" | "PAUSE" | "EXPIRE";
  notify_welcome?: boolean;
  notify_progress?: boolean;
  notify_reward_ready?: boolean;
  notify_expiry_reminder?: boolean;
  welcome_msg_template?: string | null;
  progress_msg_template?: string | null;
  reward_ready_msg_template?: string | null;
  expiry_reminder_msg_template?: string | null;
  conditions?: LoyaltyCondition[];
  condition_data?: Record<string, string>[];
  milestones?: LoyaltyMilestone[];
  milestone_data?: Record<string, string>[];
  bonus_periods?: LoyaltyBonusPeriod[];
  qr_url?: string;
  trigger_summary?: string;
  reward_summary?: string;
  enrolled_count?: string;
  active_count?: string;
  completed_members_count?: string;
  completion_rate?: string;
  completions_count?: string;
  cancelled_rewards_count?: string;
  total_rewards_given_out_value?: string;
  retention_rate?: string;
  participants?: string;
  completions?: string;
  created_at?: string;
}

export interface LoyaltyProgramDetail {
  program_info: LoyaltyProgram;
  overview: LoyaltyProgramOverview;
  qr_details: LoyaltyProgramQRDetails;
  participants: LoyaltyParticipantProgress[];
  reward_cost_report: LoyaltyRewardCostReport;
}

export interface LoyaltyProgramOverview {
  total_enrolled: number;
  active_now: number;
  completed: number;
  cancelled: number;
  retention_rate: number;
  completion_rate: number;
  total_given_out: string;
}

export interface LoyaltyProgramQRDetails {
  token: string;
  qr_url: string | null;
}

export interface LoyaltyProgramReturnLikelihood {
  program_id: string;
  program_name: string;
  return_likelihood_percentage: number;
}

export interface LoyaltyRedeem {
  loyalty_code: string;
  sale_id?: string | null;
}

export interface LoyaltyReturnLikelihood {
  after_1st_reward: number;
  after_2nd_reward: number;
  after_3rd_reward_plus: number;
}

export interface LoyaltyReward {
  id?: string;
  member_name?: string;
  loyalty_code?: string;
  program_name?: string;
  reward_type: "POINTS" | "WALLET_CREDIT" | "PERCENTAGE" | "FREE_ITEM" | "FREE_SERVICE";
  value?: string | null;
  status?: "ISSUED" | "REDEEMED" | "EXPIRED" | "REVOKED";
  issued_at?: string;
  expires_at?: string | null;
  applied_value?: string;
  redeemed_at?: string;
}

export interface LoyaltyRewardCostReport {
  total_rewards_sent: string;
  total_redeemed: string;
  cancelled_forfeited: string;
  estimated_retained_revenue: string;
  estimated_roi_percentage: number;
  return_likelihood: LoyaltyReturnLikelihood;
}

export interface LoyaltyRewardsAnalytics {
  summary: LoyaltyRewardsAnalyticsSummary;
  per_campaign_breakdown: LoyaltyCampaignCostBreakdown[];
  return_likelihood_by_program: LoyaltyProgramReturnLikelihood[];
}

export interface LoyaltyRewardsAnalyticsSummary {
  total_sent: string;
  total_redeemed: string;
  cancelled: string;
  est_retained_rev: string;
  overall_roi_percentage: number;
  avg_retention_rate: number;
}

export interface LoyaltyTier {
  id?: string;
  name: string;
  rank: number;
  qualifying_metric: "SPEND" | "VISITS";
  threshold: string;
  badge_color?: string | null;
  created_at?: string;
}

export interface MetricFrequency {
  value: number;
  mom_change: number;
  formatted: string;
}

export interface MetricPercentage {
  value: string;
  mom_percentage: number;
}

export interface MetricPoint {
  value: number;
  mom_point_change: number;
}

export interface NewVsReturningChartPoint {
  month: string;
  new_customers: number;
  returning_customers: number;
}

export interface TopSpendingCustomer {
  rank: number;
  id: string;
  initials: string;
  name: string;
  tier_name: string | null;
  visits: number;
  lifetime_value: string;
  avg_spend: string;
  retention_score: number;
}

export interface TopStreakPerformer {
  id: string;
  initials: string;
  full_name: string;
  tier: string | null;
  streak_count: number;
}

export interface TotalCustomerGrowthChart {
  total_customers: number;
  ytd_growth_percentage: string;
  chart_data: GrowthChartPoint[];
}

export interface UnifiedCustomerDashboard {
  overview: CustomerAnalyticsOverview;
  charts: ConsolidatedCustomerCharts;
  top_spending_customers: TopSpendingCustomer[];
}
