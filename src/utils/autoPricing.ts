/**
 * Automatic selling price: a price worked out from the cost and the business's
 * target profit margin. It's margin, not markup: profit as a share of the
 * selling price, so cost 8,000 at 20% sells at 10,000, not 9,600.
 */

const toNumber = (value: unknown) =>
  Number(String(value ?? "").replace(/,/g, "")) || 0;

/**
 * Rounded up, so the margin never falls below the target. Whole naira, or 0
 * when it can't be worked out.
 */
export const calculateSuggestedSellingPrice = (
  costPrice: unknown,
  targetMarginPct: unknown,
): number => {
  const cost = toNumber(costPrice);
  const margin = toNumber(targetMarginPct);
  if (cost <= 0 || margin <= 0 || margin >= 100) return 0;
  // toFixed first: floating point can land just above a whole number, and
  // rounding that up would charge a naira more than the backend works out.
  return Math.ceil(Number((cost / (1 - margin / 100)).toFixed(6)));
};

/** The profit margin a cost and selling price actually give, as a percentage. */
export const calculateRealizedMargin = (
  costPrice: unknown,
  sellingPrice: unknown,
): number => {
  const cost = toNumber(costPrice);
  const selling = toNumber(sellingPrice);
  if (selling <= 0) return 0;
  return Number((((selling - cost) / selling) * 100).toFixed(2));
};

export interface AutoPricing {
  enabled: boolean;
  /** Target margin as a whole percentage, e.g. 20. */
  margin: number;
  /** Recalculate existing products' prices when their cost changes. */
  recalculate: boolean;
}

export const autoPricingOf = (business: any): AutoPricing => {
  const margin = toNumber(business?.target_profit_margin);
  return {
    enabled:
      business?.auto_calculate_selling_price === true &&
      margin > 0 &&
      margin < 100,
    margin,
    // On unless the business has turned it off.
    recalculate: business?.recalculate_prices_on_cost_change !== false,
  };
};
