/**
 * "Sell without stock" (business.allow_sales_without_stock): when on, the POS
 * may sell past zero and stock goes negative; when off, sales are capped at
 * what's on hand. Every quantity cap goes through these so they agree.
 */

export const allowsSalesWithoutStock = (business: any): boolean =>
  business?.allow_sales_without_stock === true;

/**
 * Stock as a number. The API sometimes sends decimals as text ("10.00"), so
 * a plain `typeof === "number"` check would treat real stock as missing.
 * Null when there's no usable count.
 */
export const toQuantity = (value: unknown): number | null => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Highest cart quantity allowed for an item with `available` on hand. */
export const maxSellableQuantity = (
  available: number | string | null | undefined,
  allowOversell: boolean,
): number => {
  if (allowOversell) return Infinity;
  const qty = toQuantity(available);
  if (qty == null) return Infinity; // stock not tracked
  return Math.max(0, qty);
};

/** True when the item has nothing on hand (zero, negative or flagged). */
export const isOutOfStock = (item: {
  quantity?: number | string | null;
  status?: string | null;
}): boolean => {
  const qty = toQuantity(item.quantity);
  return item.status === "OUT-OF-STOCK" || (qty != null && qty <= 0);
};

/** Out of stock and the business doesn't allow selling past zero. */
export const isUnsellable = (
  item: { quantity?: number | string | null; status?: string | null },
  allowOversell: boolean,
): boolean => !allowOversell && isOutOfStock(item);
