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
