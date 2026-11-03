import type { DiscountThreshold } from "@/utils/discountTiers";

/** Replaces a product's (or variation's) volume tiers. `[]` removes them all. */
export const saveDiscountThresholds = async (
  productId: string,
  thresholds: DiscountThreshold[],
) => {
  const response = await fetch(
    `/api/products/discount-thresholds/${productId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thresholds }),
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.message || body?.error || "Couldn't save the bulk discounts",
    );
  }
  return body;
};

/** A product's (or variation's) saved tiers. */
export const fetchDiscountThresholds = async (
  productId: string,
): Promise<DiscountThreshold[]> => {
  const response = await fetch(`/api/products/discount-thresholds/${productId}`);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.message || body?.error || "Couldn't load the bulk discounts",
    );
  }
  // Proxy wraps the backend's { status, message, data } in { data }.
  const inner = body?.data;
  return (Array.isArray(inner) ? inner : inner?.data) ?? [];
};

/**
 * Switches off the older single discount on a product or variation, so removing
 * its tiers later doesn't bring it back. A variation is its own product record.
 */
export const clearOldDiscount = async (productId: string) => {
  const payload = new FormData();
  payload.append("discount", "0");
  payload.append("discount_threshold", "0");
  const response = await fetch(`/api/products/${productId}/edit-product`, {
    method: "PATCH",
    body: payload,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message || body?.error || "Couldn't switch off the old discount",
    );
  }
};
