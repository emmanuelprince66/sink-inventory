export interface SalesDataItem {
  name: string;
  unit_sold: number;
  revenue: number;
  profit: number;
  tax: any;
  watchlist?: boolean;
  sku: any;
  discount: number;
}

interface SalesResults {
  revenue: number;
  cost: number;
  orders: number;
  data: SalesDataItem[];
}

export interface SalesHistoryResponse {
  success: boolean;
  data: {
    results: SalesResults;
  };
  message: string;
}

export interface SalesOrderData {
  success: boolean;
  message: string;
  data: {
    limit: number;
    links: {
      next: string | null;
      previous: string | null;
    };
    pages: number;
    results: SalesOrder[];
    total: number;
  };
}

/**
 * The reward a sale redeemed.
 *
 * Only ever one per sale — the backend applies a single reward per checkout,
 * so this is an object or null and never a list.
 *
 * `reward_summary` is the composed, printable wording ("Free minimee",
 * "20% Off") and is what should reach the screen; the id/name pairs below it
 * are for matching against inventory, and only one pair is ever filled in.
 */
export interface LoyaltyRewardApplied {
  reward_id: string;
  program_name: string;
  reward_type: "FREE_ITEM" | "PERCENTAGE" | "WALLET_CREDIT" | "POINTS" | string;
  value: string | null;
  applied_value: string | null;
  reward_description: string | null;
  reward_product_id: string | null;
  reward_product_name: string | null;
  reward_service_id: string | null;
  reward_service_name: string | null;
  reward_summary: string | null;
}

/** The same reward, repeated on the line it paid for. */
export interface LoyaltyRewardInfo {
  reward_id: string;
  program_name: string;
  reward_type: string;
  reward_description: string | null;
  reward_summary?: string | null;
}

export interface SalesOrder {
  id: string;
  date: string;
  created_at: string;
  pre_sale: string;
  attendant: string;
  payment_status: "PAID" | "REVERSED" | string; // Add other possible statuses if they exist
  method: "BANK" | "ADVANCE" | "LOYALTY" | string; // Add other payment methods if they exist
  total_price: string;
  total_tax?: string;
  /**
   * What the reward took off the bill. Authoritative for new sales; sales from
   * before the checkout rewrite carry "0.00" here with the comped value on the
   * reward line instead, which is why `loyaltySavingOf` reads both.
   */
  loyalty_discount?: string;
  loyalty_reward_applied?: LoyaltyRewardApplied | null;
  reversed_by?: string | null;
  reversed_at?: string | null;
  products: Product[];
}

interface Product {
  // Add product properties based on the actual data structure
  // Since the product details weren't fully shown in the example,
  // you'll need to complete this based on the actual data
  id: string;
  name: string;
  combo_name?: string | null;
  /** Decimal string for products, which sell in fractional units; int for services. */
  quantity: number | string;
  /** Net line total — (quantity x unit_price) - discount — NOT the unit price. */
  price: string;
  unit_price: string;
  /** Row-level deduction: a manual discount, a wholesale break, or, on a reward line, what the comped item was worth. */
  discount?: string;
  image: string;
  is_loyalty_reward?: boolean;
  loyalty_reward_info?: LoyaltyRewardInfo | null;
  // ... any other product fields
}

/**
 * The least a sale has to carry for its reward to be described.
 *
 * Business order history and a customer's own purchase history return the same
 * sale from two endpoints with slightly different types either side, so the
 * helpers below take the shape they actually read rather than either concrete
 * interface — one reward is then presented identically wherever it appears.
 */
export interface RewardBearingSale {
  total_price: string;
  loyalty_discount?: string;
  loyalty_reward_applied?: LoyaltyRewardApplied | null;
  products: Array<{
    price: string | number;
    discount?: string;
    is_loyalty_reward?: boolean;
  }>;
}

/**
 * What the customer saved on this sale, in the sale's own currency units.
 *
 * `loyalty_discount` is the backend's answer and is preferred. Sales predating
 * the checkout rewrite report "0.00" there while still carrying the comped
 * amount on the reward line, so those fall back to the lines — otherwise every
 * historic redemption reads as having saved nothing.
 */
export const loyaltySavingOf = (order: RewardBearingSale): number => {
  const stated = Number(order?.loyalty_discount ?? 0);
  if (stated > 0) return stated;

  return (order?.products ?? [])
    .filter((product) => product?.is_loyalty_reward)
    .reduce((total, product) => total + Number(product?.discount ?? 0), 0);
};

/** The wording to print for a sale's reward, or null if it redeemed none. */
export const rewardSummaryOf = (
  order: RewardBearingSale,
): { label: string; program: string | null } | null => {
  const applied = order?.loyalty_reward_applied;
  if (!applied) return null;

  const label =
    applied.reward_summary ??
    applied.reward_product_name ??
    applied.reward_service_name ??
    applied.reward_description ??
    applied.program_name ??
    "Loyalty reward";

  return { label, program: applied.program_name ?? null };
};

/** Line totals as they stand, before anything the sale deducts on top. */
const lineTotalOf = (order: RewardBearingSale): number =>
  (order?.products ?? []).reduce(
    (total, product) => total + (Number(product?.price) || 0),
    0,
  );

export interface RewardBreakdown {
  label: string;
  program: string | null;
  rewardType: string;
  /** What the customer did not pay because of the reward. */
  saving: number;
  /** The bill before the reward came off. */
  subtotal: number;
  /** What was actually charged. Always the backend's figure. */
  total: number;
  /**
   * Whether the saving still has to come off the subtotal on screen.
   *
   * A free item arrives already comped — its line is priced at zero, so the
   * lines add up to what was paid and showing "- ₦5,000" underneath would
   * deduct it twice. A percentage taken off the whole bill arrives the other
   * way round: the lines are at full price and the reward is the gap between
   * them and the total. Rather than branching on reward_type and hoping the
   * backend fills each one in the way we assumed, this asks the arithmetic —
   * whichever shape the payload takes, what is on screen adds up.
   */
  deducts: boolean;
}

/**
 * How to lay a sale's reward out in a receipt summary.
 *
 * Covers every reward type from the one description: a free item reads as an
 * item given away, a percentage as money off the bill, wallet credit and
 * points as whatever the backend says they were worth. Returns null for a sale
 * that redeemed nothing.
 */
export const rewardBreakdownOf = (order: RewardBearingSale): RewardBreakdown | null => {
  const summary = rewardSummaryOf(order);
  if (!summary) return null;

  const saving = loyaltySavingOf(order);
  const total = Number(order?.total_price ?? 0) || 0;
  const lines = lineTotalOf(order);

  // Half a kobo of tolerance: these are decimal strings crossing a float, and
  // an exact === would fall to the wrong branch on a rounding crumb.
  const deducts = saving > 0 && Math.abs(lines - saving - total) < 0.01;

  return {
    label: summary.label,
    program: summary.program,
    rewardType: order?.loyalty_reward_applied?.reward_type ?? "",
    saving,
    subtotal: deducts ? lines : total,
    total,
    deducts,
  };
};
