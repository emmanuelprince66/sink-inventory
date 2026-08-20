// Shape and copy for the Create Loyalty Programme wizard. Kept apart from the
// component so the step list, option sets and payload builder can be read (and
// changed) without wading through JSX.

export const STEPS = [
  "Name",
  "Goal",
  "Reward",
  "Style",
  "Rules",
  "Time",
  "Expiry",
  "Notify",
  "Review",
] as const;

export type StepName = (typeof STEPS)[number];

export const NAME_PRESETS = [
  "Coffee Club Rewards",
  "VIP Customers",
  "Shop & Earn",
  "Beauty Points",
];

export const GOALS = [
  {
    value: "VISIT",
    icon: "🚶",
    title: "Increase customer visits",
    text: "Reward customers for coming back more often. Track visit streaks.",
  },
  {
    value: "SPEND",
    icon: "💳",
    title: "Increase customer spending",
    text: "Reward customers who spend more per visit or cumulatively.",
  },
  {
    value: "BOTH",
    icon: "🚀",
    title: "Increase both visits and spending",
    text: "Combine visit streaks with minimum spend thresholds for maximum loyalty.",
  },
] as const;

/** Maps 1:1 onto the reward_type enum. */
export const REWARDS = [
  { value: "POINTS", icon: "⭐", title: "Points", hint: "e.g. 100 Points" },
  {
    value: "WALLET_CREDIT",
    icon: "💵",
    title: "Cash Discount",
    hint: "e.g. ₦2,000 Off",
  },
  {
    value: "PERCENTAGE",
    icon: "🏷️",
    title: "Percentage Off",
    hint: "e.g. 10% Off",
  },
  {
    value: "FREE_ITEM",
    icon: "🎁",
    title: "Free Product",
    hint: "e.g. Free Coffee",
  },
  {
    value: "FREE_SERVICE",
    icon: "✂️",
    title: "Free Service",
    hint: "e.g. Free Hair Wash",
  },
] as const;

export const STYLES = [
  {
    value: "CONTINUOUS",
    icon: "🔄",
    title: "Continuous Rewards",
    text: "Customers can complete the streak over and over — perfect for long-term loyalty.",
  },
  {
    value: "ONE_TIME",
    icon: "🎯",
    title: "One-Time Reward",
    text: "The streak ends after the reward is given. Great for promotions and special offers.",
  },
] as const;

export const TIME_LIMITS = [
  { value: 0, icon: "♾️", title: "No time limit", text: "Customers can take as long as they need." },
  { value: 7, icon: "⚡", title: "Within 7 days", text: "Complete within a week." },
  { value: 30, icon: "📅", title: "Within 30 days", text: "One month to complete the streak." },
  { value: 60, icon: "📆", title: "Within 60 days", text: "Two months for the full streak." },
  { value: -1, icon: "✏️", title: "Custom period", text: "Set your own number of days." },
] as const;

/** Maps 1:1 onto the timeout_action enum. */
export const TIMEOUT_ACTIONS = [
  {
    value: "RESTART",
    icon: "🔄",
    title: "Restart progress from zero",
    text: "Progress resets completely — they start fresh from Visit 1.",
  },
  {
    value: "PAUSE",
    icon: "⏸️",
    title: "Pause progress until they return",
    text: "Progress is saved but frozen. It resumes on their next visit.",
  },
  {
    value: "EXPIRE",
    icon: "❌",
    title: "Expire the loyalty programme",
    text: "The programme ends for that customer entirely.",
  },
] as const;

export const NOTIFICATIONS = [
  {
    key: "notify_welcome",
    title: "Welcome message",
    text: "Sent the moment a customer joins.",
  },
  {
    key: "notify_progress",
    title: "Progress updates",
    text: "Sent after each qualifying visit.",
  },
  {
    key: "notify_reward_ready",
    title: "Reward ready",
    text: "Sent when they have earned the reward.",
  },
  {
    key: "notify_expiry_reminder",
    title: "Expiry reminder",
    text: "Sent before their progress runs out of time.",
  },
] as const;

/** How the programme's automatic messages reach the customer. */
export const CHANNELS = [
  {
    value: "EMAIL",
    icon: "✉️",
    title: "Email only",
    text: "0.3 unit per message · ₦3.50",
  },
  {
    value: "SMS",
    icon: "📱",
    title: "SMS only",
    text: "1 unit per message · ₦10.00",
  },
  {
    value: "BOTH",
    icon: "📨",
    title: "Email and SMS",
    text: "1.3 units per message · ₦13.50",
  },
] as const;

export interface WizardState {
  businessName: string;
  name: string;
  description: string;
  goal: (typeof GOALS)[number]["value"];
  rewardType: (typeof REWARDS)[number]["value"];
  rewardValue: string;
  /** Set when rewardType is FREE_ITEM — the inventory product given away. */
  rewardProductId: string;
  rewardProductName: string;
  /** Set when rewardType is FREE_SERVICE. */
  rewardServiceId: string;
  rewardServiceName: string;
  channel: (typeof CHANNELS)[number]["value"];
  rewardStyle: (typeof STYLES)[number]["value"];
  ruleMode: "VISIT" | "SPEND" | "BOTH";
  visits: number;
  minSpendPerVisit: string;
  spendThreshold: string;
  /** 0 = no limit, otherwise days. */
  timeLimitDays: number;
  customDays: string;
  timeoutAction: (typeof TIMEOUT_ACTIONS)[number]["value"];
  notify_welcome: boolean;
  notify_progress: boolean;
  notify_reward_ready: boolean;
  notify_expiry_reminder: boolean;
}

export const INITIAL_STATE: WizardState = {
  businessName: "",
  name: "",
  description: "",
  goal: "VISIT",
  rewardType: "PERCENTAGE",
  rewardValue: "",
  rewardProductId: "",
  rewardProductName: "",
  rewardServiceId: "",
  rewardServiceName: "",
  // Matches the API's own default, so what the step shows and what the
  // programme would do without input never disagree.
  channel: "BOTH",
  rewardStyle: "CONTINUOUS",
  ruleMode: "VISIT",
  visits: 5,
  minSpendPerVisit: "",
  spendThreshold: "",
  timeLimitDays: 0,
  customDays: "",
  timeoutAction: "RESTART",
  notify_welcome: true,
  notify_progress: true,
  notify_reward_ready: true,
  notify_expiry_reminder: true,
};

/** Builds the create payload, shaped to the LoyaltyProgram create schema. */
export const buildPayload = (s: WizardState) => {
  const conditions: Record<string, unknown>[] = [];

  if (s.ruleMode === "VISIT" || s.ruleMode === "BOTH") {
    conditions.push({
      type: "VISIT",
      threshold: String(s.visits),
      // Only meaningful when a visit has to be worth something to count.
      ...(s.minSpendPerVisit.trim()
        ? { min_spend_per_visit: s.minSpendPerVisit.trim() }
        : {}),
    });
  }
  if (s.ruleMode === "SPEND" || s.ruleMode === "BOTH") {
    conditions.push({ type: "SPEND", threshold: s.spendThreshold.trim() || "0" });
  }

  const days =
    s.timeLimitDays === -1 ? Number(s.customDays || 0) : s.timeLimitDays;

  return {
    name: s.name.trim(),
    description: s.description.trim() || undefined,
    // The API requires a start date; a programme created today starts today.
    start_date: new Date().toISOString().slice(0, 10),
    status: "ACTIVE",
    reward_type: s.rewardType,
    reward_value: s.rewardValue.trim() || undefined,
    // Only one of these is ever set, and only for the matching reward type.
    reward_product: s.rewardType === "FREE_ITEM" ? s.rewardProductId : undefined,
    reward_service:
      s.rewardType === "FREE_SERVICE" ? s.rewardServiceId : undefined,
    // SMS | EMAIL | BOTH — the API defaults to BOTH, and so does the step.
    communication_channel: s.channel,
    reward_style: s.rewardStyle,
    // Null rather than 0 — 0 would read as "must finish within zero days".
    completion_window_days: days > 0 ? days : null,
    timeout_action: s.timeoutAction,
    notify_welcome: s.notify_welcome,
    notify_progress: s.notify_progress,
    notify_reward_ready: s.notify_reward_ready,
    notify_expiry_reminder: s.notify_expiry_reminder,
    condition_data: conditions,
  };
};

/** The label/value pairs the Review step reads back to the user. */
export const summaryRows = (s: WizardState) => [
  { label: "Business", value: s.businessName || "—" },
  { label: "Programme", value: s.name || "—" },
  {
    label: "Goal",
    value: GOALS.find((g) => g.value === s.goal)?.title ?? "—",
  },
  {
    label: "Reward",
    value: `${REWARDS.find((r) => r.value === s.rewardType)?.title ?? "—"}${
      // A give-away names the item; everything else carries a number.
      s.rewardType === "FREE_ITEM" && s.rewardProductName
        ? ` — ${s.rewardProductName}`
        : s.rewardType === "FREE_SERVICE" && s.rewardServiceName
          ? ` — ${s.rewardServiceName}`
          : s.rewardValue
            ? ` — ${s.rewardValue}`
            : ""
    }`,
  },
  {
    label: "Style",
    value: STYLES.find((v) => v.value === s.rewardStyle)?.title ?? "—",
  },
  {
    label: "Rule",
    value:
      s.ruleMode === "SPEND"
        ? `Spend ${s.spendThreshold || 0}`
        : `${s.visits} visits`,
  },
  {
    label: "Time Limit",
    value:
      s.timeLimitDays === 0
        ? "No limit"
        : s.timeLimitDays === -1
          ? `${s.customDays || 0} days`
          : `${s.timeLimitDays} days`,
  },
  {
    label: "If Expired",
    value: TIMEOUT_ACTIONS.find((a) => a.value === s.timeoutAction)?.title ?? "—",
  },
  {
    label: "Notifications",
    value: `${NOTIFICATIONS.filter(({ key }) => s[key]).length} messages enabled`,
  },
  {
    label: "Sent via",
    value: CHANNELS.find((c) => c.value === s.channel)?.title ?? "—",
  },
];

/** Blocks Continue until the current step has what it needs. */
export const stepError = (step: StepName, s: WizardState): string | null => {
  if (step === "Name" && !s.name.trim()) return "Give the programme a name.";
  if (step === "Reward") {
    const needsValue =
      s.rewardType === "POINTS" ||
      s.rewardType === "WALLET_CREDIT" ||
      s.rewardType === "PERCENTAGE";
    if (needsValue && !s.rewardValue.trim())
      return "Enter how much the reward is worth.";
    // A give-away with nothing chosen would create a programme whose reward
    // the till cannot hand over.
    if (s.rewardType === "FREE_ITEM" && !s.rewardProductId)
      return "Pick the product customers will get free.";
    if (s.rewardType === "FREE_SERVICE" && !s.rewardServiceId)
      return "Pick the service customers will get free.";
  }
  if (step === "Rules") {
    if ((s.ruleMode === "VISIT" || s.ruleMode === "BOTH") && s.visits < 1)
      return "A streak needs at least one visit.";
    if (
      (s.ruleMode === "SPEND" || s.ruleMode === "BOTH") &&
      !s.spendThreshold.trim()
    )
      return "Enter the spend target.";
  }
  if (step === "Time" && s.timeLimitDays === -1 && !s.customDays.trim())
    return "Enter the number of days.";
  return null;
};
