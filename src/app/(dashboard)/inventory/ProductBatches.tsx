"use client";

import { useFetchProductByIdQuery } from "@/api/products/fetch-products-by-id";
import { Spinner } from "@/components/app/Spinner";
import { formatToNaira } from "@/utils/formatMoney";
import { AlertTriangle, Layers } from "lucide-react";
import moment from "moment";
import { ProductBatch, UrgencyPill, formatQty } from "./batch";

/**
 * Stock broken down by batch, in the order the backend sells it: earliest
 * expiry first (FEFO), then non-perishables oldest first (FIFO).
 *
 * The inventory row that opens View Details carries no batches — only the
 * single-product endpoint does — so this fetches the product itself.
 */
const ProductBatches = ({ productId }: { productId: string }) => {
  const { data, isLoading } = useFetchProductByIdQuery(productId, {
    enabled: Boolean(productId),
  });

  // The proxy wraps the backend body in { data }; the backend may wrap the
  // product once more.
  const product = data?.data?.data ?? data?.data;
  const batches: ProductBatch[] = Array.isArray(product?.batches)
    ? product.batches
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  // Older products and services have no batches at all: say nothing rather
  // than render an empty box.
  if (batches.length === 0) return null;

  const expired = batches.filter((b) => b.urgency === "EXPIRED");
  const expiredUnits = expired.reduce((sum, b) => sum + Number(b.quantity || 0), 0);

  return (
    <div className="rounded-xl border border-grey-5 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-grey-5 bg-grey-6/50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-green-300" />
          <h4 className="text-sm font-extrabold text-grey-1">
            Batches ({batches.length})
          </h4>
        </div>
        <p className="text-[11px] text-grey-3">Sold in this order</p>
      </div>

      {/* Expired stock is still counted as stock, so call it out: it is the
          one thing on this list the merchant has to act on. */}
      {expired.length > 0 && (
        <div className="flex items-start gap-2 px-4 py-2.5 bg-rose-50 border-b border-rose-100 text-xs text-rose-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold">{formatQty(expiredUnits)} units</span>{" "}
            in {expired.length} expired batch{expired.length === 1 ? "" : "es"}{" "}
            still count as stock. Remove them from your shelf.
          </p>
        </div>
      )}

      <ul>
        {batches.map((batch) => (
          <li
            key={batch.id}
            className="flex flex-col gap-2 px-4 py-3 border-b border-grey-6 last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-grey-1 truncate">
                {batch.batch_name}
              </p>
              <p className="text-[11px] text-grey-3 truncate">
                {[
                  // Named only on a product with variants, where the list
                  // covers every variant at once.
                  batch.product_name,
                  batch.date_received &&
                    `Received ${moment(batch.date_received).format("D MMM YYYY")}`,
                  batch.cost_price != null &&
                    `Cost ${formatToNaira(Number(batch.cost_price))}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-extrabold text-grey-1">
                  {formatQty(batch.quantity)}
                </p>
                <p className="text-[10px] text-grey-3">in stock</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 min-w-[112px]">
                <UrgencyPill
                  days={batch.days_until_expiry}
                  urgency={batch.urgency}
                />
                {batch.expiry_date && (
                  <p className="text-[10px] text-grey-3">
                    {moment(batch.expiry_date).format("D MMM YYYY")}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductBatches;
