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

/**
 * Offline sales waiting to sync haven't reached the server yet, so its stock
 * figure still counts those units. Stock on screen is always worked out as
 * server stock minus what's queued (see useQueuedStock); the product data and
 * cart lines themselves keep the server's number, so it corrects itself as
 * soon as the sales sync. Null when the item has no stock count.
 */
export const adjustedQuantity = (
  quantity: unknown,
  queued: number = 0,
): number | null => {
  const qty = toQuantity(quantity);
  if (qty == null) return null;
  // Decimals are sold too; don't let 1.5 - 0.1 show as 1.4000000000000001.
  return queued ? Math.round((qty - queued) * 1000) / 1000 : qty;
};

/** The id a cart line or product is queued under in an offline sale. */
export const stockIdOf = (item: { id?: unknown; productId?: unknown }): string =>
  String(item.productId ?? item.id ?? "");

/** A copy of the item showing its stock after `queued` units have gone. */
export const withQueuedStock = <T>(item: T, queued: number): T => {
  if (!queued) return item;
  const source = item as any;
  const quantity = adjustedQuantity(source.quantity, queued);
  if (quantity == null) return item;

  const lowAt = toQuantity(source.low_stock_threshold);
  const status =
    quantity <= 0
      ? "OUT-OF-STOCK"
      : lowAt != null && quantity <= lowAt && source.status !== "OUT-OF-STOCK"
        ? "LOW"
        : source.status;
  return { ...source, quantity, status };
};

/**
 * What a product card shows and checks. A product with variations holds its
 * stock on the variations, so that's what is added up. `view` is what to pass
 * to isUnsellable; it only differs from the product once sales are queued, so
 * nothing changes for a till with an empty queue.
 */
export const productStockView = <T>(
  product: T,
  queuedFor: (id: string) => number,
): { stock: number | null; view: T } => {
  const source = product as any;
  const variations: any[] = source.variations ?? [];

  if (!variations.length) {
    const view = withQueuedStock(product, queuedFor(stockIdOf(source)));
    return { stock: toQuantity((view as any).quantity), view };
  }

  const counts = variations.map((variation) =>
    adjustedQuantity(variation.quantity, queuedFor(stockIdOf(variation))),
  );
  const known = counts.filter((count): count is number => count != null);
  const stock = known.length
    ? Math.round(known.reduce((sum, count) => sum + count, 0) * 1000) / 1000
    : toQuantity(source.quantity);

  if (!variations.some((variation) => queuedFor(stockIdOf(variation)))) {
    return { stock, view: product };
  }
  const sellable = known.filter((count) => count > 0);
  // A variation with no count isn't tracked, so it can always be sold.
  const canSell = sellable.length > 0 || known.length < counts.length;
  return {
    stock,
    view: {
      ...source,
      quantity: sellable.reduce((sum, count) => sum + count, 0),
      status: canSell ? source.status : "OUT-OF-STOCK",
    },
  };
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
