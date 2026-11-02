/**
 * Volume ("bulk") discount tiers — product.discount_thresholds.
 *
 * A tier covers a quantity range and, once reached, discounts EVERY unit on
 * the line. With no tiers, the legacy single threshold applies: `discount`
 * is a percentage off once `discount_threshold` units are bought.
 *
 * calculateProductDiscount mirrors the backend's own formula so the cart
 * total matches the invoice to the kobo.
 */

/**
 * "FIXED_AMOUNT" is ₦ off per unit. The backend has also called it "PRICE",
 * so anything that isn't "PERCENTAGE" is read as ₦ off.
 */
export type DiscountTierType = "PERCENTAGE" | "FIXED_AMOUNT" | "PRICE";

/** What a ₦-off tier is sent as: the backend enum is "PRICE" | "PERCENTAGE". */
export const FLAT_TIER_TYPE: DiscountTierType = "PRICE";

export interface DiscountThreshold {
  id?: string;
  min_quantity: number;
  max_quantity?: number | null;
  discount_type: DiscountTierType;
  discount_value: number | string;
}

export interface LineDiscountResult {
  unitPrice: number;
  unitDiscount: number;
  discountedUnitPrice: number;
  totalDiscount: number;
  subtotal: number;
  appliedTier: DiscountThreshold | null;
  /** 1-based position of the applied tier, for "Tier 2" badges. */
  appliedTierNumber: number | null;
  nextTierUpsell: {
    unitsNeeded: number;
    potentialDiscountType: DiscountTierType;
    potentialDiscountValue: number;
  } | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const sortTiers = (tiers: DiscountThreshold[] = []) =>
  [...tiers].sort((a, b) => Number(a.min_quantity) - Number(b.min_quantity));

export function calculateProductDiscount(
  sellingPrice: number,
  quantity: number,
  thresholds: DiscountThreshold[] = [],
  fallbackDiscount: number = 0,
  fallbackThreshold: number = 0,
): LineDiscountResult {
  const price = Number(sellingPrice) || 0;
  const gross = price * quantity;
  let unitDiscount = 0;
  let appliedTier: DiscountThreshold | null = null;
  let appliedTierNumber: number | null = null;
  let nextTierUpsell: LineDiscountResult["nextTierUpsell"] = null;

  if (thresholds && thresholds.length > 0) {
    const sorted = sortTiers(thresholds);

    sorted.some((tier, index) => {
      const minQ = Number(tier.min_quantity);
      const maxQ =
        tier.max_quantity != null ? Number(tier.max_quantity) : Infinity;
      if (quantity >= minQ && quantity <= maxQ) {
        appliedTier = tier;
        appliedTierNumber = index + 1;
        const val = Number(tier.discount_value);
        unitDiscount =
          tier.discount_type === "PERCENTAGE"
            ? round2(price * (val / 100))
            : Math.min(val, price);
        return true;
      }
      return false;
    });

    const nextTier = sorted.find((t) => Number(t.min_quantity) > quantity);
    if (nextTier) {
      nextTierUpsell = {
        unitsNeeded: round2(Number(nextTier.min_quantity) - quantity),
        potentialDiscountType: nextTier.discount_type,
        potentialDiscountValue: Number(nextTier.discount_value),
      };
    }
  } else if (
    fallbackDiscount > 0 &&
    fallbackThreshold > 0 &&
    quantity >= fallbackThreshold
  ) {
    // Capped: some older values were saved as naira, not percent.
    unitDiscount = Math.min(
      price,
      round2(price * (Number(fallbackDiscount) / 100)),
    );
  }

  const totalDiscount = round2(unitDiscount * quantity);
  return {
    unitPrice: price,
    unitDiscount,
    discountedUnitPrice: Math.max(0, round2(price - unitDiscount)),
    totalDiscount,
    subtotal: Math.max(0, round2(gross - totalDiscount)),
    appliedTier,
    appliedTierNumber,
    nextTierUpsell,
  };
}

/* ----------------------------------------------------------------- labels */

const naira = (n: number) =>
  `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

/** "10% off" or "₦500 off each". */
export const describeDiscount = (type: DiscountTierType, value: number | string) =>
  type === "PERCENTAGE"
    ? `${Number(value)}% off`
    : `${naira(Number(value))} off each`;

/** "5–9" or "20+". */
export const tierRangeLabel = (tier: DiscountThreshold) =>
  tier.max_quantity != null
    ? `${Number(tier.min_quantity)}–${Number(tier.max_quantity)}`
    : `${Number(tier.min_quantity)}+`;

/* ------------------------------------------------------------- validation */

/** Same rules the backend enforces. Returns the first problem, or null. */
export const validateTiers = (
  tiers: DiscountThreshold[],
  sellingPrice?: number | null,
): string | null => {
  if (!tiers.length) return null;
  const sorted = sortTiers(tiers);
  let openEnded = 0;

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    const min = Number(tier.min_quantity);
    const max = tier.max_quantity != null ? Number(tier.max_quantity) : null;
    const value = Number(tier.discount_value);
    const label = `Tier ${i + 1}`;

    if (!Number.isInteger(min) || min < 1)
      return `${label}: minimum quantity must be a whole number of at least 1`;
    if (max !== null && (!Number.isInteger(max) || max < min))
      return `${label}: maximum quantity must be a whole number no lower than the minimum`;
    if (!(value > 0)) return `${label}: discount must be more than 0`;
    if (tier.discount_type === "PERCENTAGE" && value > 100)
      return `${label}: a percentage discount can't be more than 100%`;
    if (
      tier.discount_type !== "PERCENTAGE" &&
      sellingPrice != null &&
      Number(sellingPrice) > 0 &&
      value > Number(sellingPrice)
    )
      return `${label}: a fixed discount can't be more than the selling price`;

    if (max === null) openEnded++;
    const prev = sorted[i - 1];
    if (prev) {
      const prevMax = prev.max_quantity != null ? Number(prev.max_quantity) : null;
      if (prevMax === null || min <= prevMax)
        return `Tiers ${i} and ${i + 1} overlap. Each range must start after the one before ends.`;
    }
  }

  if (openEnded > 1) return "Only one tier can have no maximum (e.g. 20+)";
  return null;
};

/** Form rows (strings) → API payload. Blank max means open-ended. */
export interface DiscountTierFormRow {
  min_quantity: string;
  max_quantity: string;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: string;
}

export const emptyTierRow = (): DiscountTierFormRow => ({
  min_quantity: "",
  max_quantity: "",
  discount_type: "PERCENTAGE",
  discount_value: "",
});

export const tierRowsToPayload = (
  rows: DiscountTierFormRow[] = [],
): DiscountThreshold[] =>
  rows
    .filter((row) => row.min_quantity !== "" || row.discount_value !== "")
    .map((row) => ({
      min_quantity: Number(row.min_quantity),
      max_quantity: row.max_quantity === "" ? null : Number(row.max_quantity),
      discount_type:
        row.discount_type === "PERCENTAGE" ? "PERCENTAGE" : FLAT_TIER_TYPE,
      discount_value: Number(row.discount_value),
    }));

export const tiersToFormRows = (
  tiers?: DiscountThreshold[] | null,
): DiscountTierFormRow[] =>
  sortTiers(tiers ?? []).map((tier) => ({
    min_quantity:
      tier.min_quantity != null ? String(Number(tier.min_quantity)) : "",
    max_quantity:
      tier.max_quantity != null ? String(Number(tier.max_quantity)) : "",
    // The editor knows two choices: percent, or ₦ off ("FIXED_AMOUNT").
    discount_type:
      !tier.discount_type || tier.discount_type === "PERCENTAGE"
        ? "PERCENTAGE"
        : "FIXED_AMOUNT",
    discount_value:
      tier.discount_value != null ? String(Number(tier.discount_value)) : "",
  }));
