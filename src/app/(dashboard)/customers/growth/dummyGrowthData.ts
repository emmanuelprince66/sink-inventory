// Dummy data for the new Customer Growth Platform tabs (Overview, Analytics,
// Segments, Loyalty Programs, Rewards, AI Recommendations, Referrals).
//
// None of this is wired to a backend yet — every value here is a static
// placeholder matching the design mockup. When real endpoints exist, replace
// the exported constants below with query hooks and keep the shapes the same
// so the tab components don't need to change.

export interface GrowthKpi {
  label: string;
  value: string;
  delta: string;
}

export const OVERVIEW_KPIS: GrowthKpi[] = [
  { label: "Total Customers", value: "222", delta: "+14.4% vs last month" },
  { label: "Active Customers", value: "186", delta: "+8.2% vs last month" },
  { label: "New This Month", value: "28", delta: "+47% vs last month" },
  { label: "Returning", value: "74", delta: "+11.3% vs last month" },
  { label: "Retention Rate", value: "84%", delta: "+6pt vs last month" },
  { label: "Churn Rate", value: "6.8%", delta: "-2.1pt vs last month" },
  { label: "Avg. Lifetime Value", value: "₦95K", delta: "+22% vs last month" },
  { label: "Loyalty Members", value: "104", delta: "+18.2% vs last month" },
];

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const RETENTION_TREND = [68, 70, 69, 72, 78, 84];

export const NEW_VS_RETURNING = {
  new: [8, 12, 9, 15, 14, 18],
  returning: [42, 48, 45, 58, 62, 74],
};

export const TOTAL_GROWTH = {
  labels: ["Feb", "Mar", "Apr", "May", "Jun"],
  values: [150, 168, 185, 202, 222],
  total: 222,
  ytdDelta: "+85% YTD",
};

export interface AiInsight {
  text: string;
  actionLabel: string;
}

export const AI_INSIGHTS: AiInsight[] = [
  { text: "Repeat purchases increased by 18% this month.", actionLabel: "View Analytics" },
  { text: "36 customers have not returned in 45+ days.", actionLabel: "Win Back" },
  { text: "Saturday generates the highest repeat purchases.", actionLabel: "Schedule Campaign" },
  { text: "Top 20 customers generated 48% of your revenue.", actionLabel: "Reward VIPs" },
];

// ─── Analytics tab ──────────────────────────────────────────────────────────

export const ANALYTICS_KPIS: GrowthKpi[] = [
  { label: "Repeat Purchase Rate", value: "68%", delta: "+5pt vs last month" },
  { label: "Avg. Visit Frequency", value: "2.4x/mo", delta: "+0.4x vs last month" },
  { label: "Avg. Order Value", value: "₦6,200", delta: "+12% vs last month" },
  { label: "Revenue Per Customer", value: "₦27,400", delta: "+18% vs last month" },
];

export interface TopSpender {
  name: string;
  tier: "VIP" | "Gold" | "Silver" | "Bronze";
  visits: number;
  lifetimeValue: string;
  avgSpend: string;
  score: number;
}

export const TOP_SPENDERS: TopSpender[] = [
  { name: "Chiamaka Eze", tier: "VIP", visits: 42, lifetimeValue: "₦294,000", avgSpend: "₦7,000", score: 97 },
  { name: "Samson Akinola", tier: "VIP", visits: 28, lifetimeValue: "₦185,000", avgSpend: "₦6,607", score: 92 },
  { name: "Olosunde Olosunde", tier: "Gold", visits: 15, lifetimeValue: "₦98,000", avgSpend: "₦6,533", score: 78 },
  { name: "Yusuf Bala", tier: "Silver", visits: 9, lifetimeValue: "₦42,000", avgSpend: "₦4,667", score: 45 },
  { name: "Sarah Adeyemi", tier: "Silver", visits: 7, lifetimeValue: "₦31,500", avgSpend: "₦4,500", score: 38 },
  { name: "Bola Adeyomi", tier: "Bronze", visits: 4, lifetimeValue: "₦18,000", avgSpend: "₦4,500", score: 22 },
];

// ─── Segments tab ───────────────────────────────────────────────────────────

export interface CustomerSegment {
  key: string;
  name: string;
  customerCount: number;
  revenue: string;
  repeatRate: string;
  avgSpend: string;
  tone: "purple" | "amber" | "blue" | "red" | "grey" | "green";
}

export const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  { key: "vip", name: "VIP Customers", customerCount: 12, revenue: "₦2.1M", repeatRate: "94%", avgSpend: "₦12,500", tone: "purple" },
  { key: "frequent", name: "Frequent Buyers", customerCount: 38, revenue: "₦1.4M", repeatRate: "82%", avgSpend: "₦8,200", tone: "amber" },
  { key: "new", name: "New Customers", customerCount: 28, revenue: "₦420K", repeatRate: "—", avgSpend: "₦5,100", tone: "blue" },
  { key: "at_risk", name: "At Risk", customerCount: 21, revenue: "₦280K", repeatRate: "31%", avgSpend: "₦3,800", tone: "red" },
  { key: "inactive", name: "Inactive", customerCount: 15, revenue: "₦0", repeatRate: "0%", avgSpend: "₦0", tone: "grey" },
  { key: "regular", name: "Regular Buyers", customerCount: 64, revenue: "₦1.8M", repeatRate: "67%", avgSpend: "₦6,200", tone: "green" },
];

// ─── Loyalty Programs tab ───────────────────────────────────────────────────

export interface StreakLeader {
  initials: string;
  name: string;
  tier: string;
  streak: number;
  progressPct: number;
  nextRewardIn: string;
}

export const STREAK_LEADERS: StreakLeader[] = [
  { initials: "CE", name: "Chiamaka", tier: "VIP", streak: 8, progressPct: 80, nextRewardIn: "Next reward in 2 visits" },
  { initials: "SA", name: "Samson", tier: "VIP", streak: 5, progressPct: 50, nextRewardIn: "Next reward in 5 visits" },
  { initials: "OO", name: "Olosunde", tier: "Gold", streak: 3, progressPct: 30, nextRewardIn: "Next reward in 7 visits" },
];

export interface LoyaltyCampaign {
  key: string;
  name: string;
  triggerLabel: string;
  rewardLabel: string;
  participants: number;
  completions: number;
  completionRate: string;
  status: "Active" | "Paused";
}

export const LOYALTY_CAMPAIGNS: LoyaltyCampaign[] = [
  { key: "visit_streak", name: "Visit Streak Reward", triggerLabel: "10 visits", rewardLabel: "10% Discount", participants: 45, completions: 12, completionRate: "27%", status: "Active" },
  { key: "big_spender", name: "Big Spender", triggerLabel: "₦50,000 spent", rewardLabel: "₦2,000 Wallet Credit", participants: 18, completions: 6, completionRate: "33%", status: "Active" },
  { key: "birthday", name: "Birthday Special", triggerLabel: "Birthday month", rewardLabel: "Free Product", participants: 32, completions: 8, completionRate: "25%", status: "Active" },
  { key: "referral_champion", name: "Referral Champion", triggerLabel: "3 referrals", rewardLabel: "₦5,000 Cash Credit", participants: 9, completions: 3, completionRate: "33%", status: "Paused" },
];

// ─── Rewards tab ─────────────────────────────────────────────────────────────

export const REWARDS_KPIS: GrowthKpi[] = [
  { label: "Active Rewards", value: "4", delta: "" },
  { label: "Total Issued", value: "104", delta: "" },
  { label: "Redeemed", value: "29", delta: "" },
  { label: "Redemption Rate", value: "27.9%", delta: "" },
];

export interface RewardRow {
  key: string;
  name: string;
  type: string;
  issued: number;
  redeemed: number;
  expired: number;
  cost: string;
  roi: string;
}

export const REWARDS: RewardRow[] = [
  { key: "discount_10", name: "10% Discount Voucher", type: "Percentage Discount", issued: 45, redeemed: 12, expired: 3, cost: "₦36,000", roi: "+18%" },
  { key: "wallet_2000", name: "₦2,000 Wallet Credit", type: "Wallet Credit", issued: 18, redeemed: 6, expired: 1, cost: "₦12,000", roi: "+24%" },
  { key: "free_bread", name: "Free Product (Bread)", type: "Free Product", issued: 32, redeemed: 8, expired: 4, cost: "₦25,600", roi: "+11%" },
  { key: "cash_5000", name: "₦5,000 Cash Credit", type: "Cash Discount", issued: 9, redeemed: 3, expired: 0, cost: "₦15,000", roi: "+41%" },
];

// ─── AI Recommendations tab ─────────────────────────────────────────────────

export interface AiRecommendation {
  key: string;
  title: string;
  impact: "HIGH IMPACT" | "MEDIUM IMPACT" | "LOW IMPACT";
  confidence: number;
  description: string;
  actionLabel: string;
  tone: "rose" | "violet" | "amber" | "emerald" | "blue";
}

export const AI_RECOMMENDATIONS: AiRecommendation[] = [
  {
    key: "win_back",
    title: "Win back 21 at-risk customers",
    impact: "HIGH IMPACT",
    confidence: 91,
    description: "36 customers haven't returned in 45 days. A personalised discount could recover 60% of them.",
    actionLabel: "Send Campaign",
    tone: "rose",
  },
  {
    key: "reward_top20",
    title: "Reward your top 20 customers",
    impact: "HIGH IMPACT",
    confidence: 88,
    description: "Top 20 customers generated 48% of your revenue. Upgrading their tier increases retention by 34%.",
    actionLabel: "Create Reward",
    tone: "violet",
  },
  {
    key: "referral_campaign",
    title: "Launch a referral campaign",
    impact: "MEDIUM IMPACT",
    confidence: 82,
    description: "Customers who use referral codes spend 34% more on average. Your network could generate ₦180K extra/month.",
    actionLabel: "Create Referral",
    tone: "rose",
  },
  {
    key: "reduce_streak",
    title: "Reduce visit streak from 10 to 8",
    impact: "MEDIUM IMPACT",
    confidence: 79,
    description: "Lowering the threshold could increase reward completions by 28% and drive repeat visits.",
    actionLabel: "Edit Program",
    tone: "emerald",
  },
  {
    key: "birthday_campaign",
    title: "Introduce a birthday campaign",
    impact: "MEDIUM IMPACT",
    confidence: 86,
    description: "Customers with birthday rewards spend 52% more in their birthday month vs regular visits.",
    actionLabel: "Create Campaign",
    tone: "amber",
  },
  {
    key: "bundle_bread_butter",
    title: "Bundle Bread with Butter",
    impact: "LOW IMPACT",
    confidence: 74,
    description: "82% of customers who buy Bread also purchase Butter within the same week. Bundle for a combo discount.",
    actionLabel: "Create Bundle",
    tone: "blue",
  },
];

// ─── Referrals tab ───────────────────────────────────────────────────────────

export const REFERRAL_KPIS: GrowthKpi[] = [
  { label: "Total Referrals", value: "24", delta: "" },
  { label: "Revenue Generated", value: "₦247,000", delta: "" },
  { label: "Active Referrers", value: "8", delta: "" },
];

export interface TopReferrer {
  initials: string;
  name: string;
  code: string;
  successfulReferrals: number;
  revenueGenerated: string;
  status: "Active" | "Inactive";
}

export const TOP_REFERRERS: TopReferrer[] = [
  { initials: "CE", name: "Chiamaka Eze", code: "CHI2024", successfulReferrals: 8, revenueGenerated: "₦124,000", status: "Active" },
  { initials: "SA", name: "Samson Akinola", code: "SAM2025", successfulReferrals: 5, revenueGenerated: "₦78,000", status: "Active" },
  { initials: "OO", name: "Olosunde Olosunde", code: "TOB2025", successfulReferrals: 3, revenueGenerated: "₦45,000", status: "Active" },
];
