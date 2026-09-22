"use client";

import { useFetchProductByIdQuery } from "@/api/products/fetch-products-by-id";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";
import { ProductBatch, expiryLabel, formatQty } from "./batch";

/**
 * Leaving the batch to the backend. Radix treats "" as "nothing selected", so
 * the automatic option needs a value of its own; callers translate it back to
 * "send no batch_id".
 */
export const AUTO_BATCH = "AUTO";

/**
 * The variant a batch belongs to, when the product has variants — the list
 * covers the parent and all of them, so an unlabelled "Batch A" would be
 * ambiguous. Empty when the name just repeats the product's own.
 */
const variantName = (batch: ProductBatch) =>
  batch.product_name && batch.product_name !== batch.batch_name
    ? batch.product_name
    : "";

/**
 * Picks which batch a return, damage or waste comes out of.
 *
 * Optional everywhere it is used: with no batch chosen the backend deducts
 * from the earliest-expiring batch (FEFO), which is the right answer often
 * enough to be the default. It matters when it isn't — the broken bottle came
 * from the crate that expires in June, not the one on the shelf.
 *
 * Renders nothing for a product with no batches, so older stock and services
 * see the form exactly as before.
 */
const BatchSelect = ({
  productId,
  value,
  onChange,
  label = "Batch",
}: {
  productId?: string | null;
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}) => {
  const { data } = useFetchProductByIdQuery(productId, {
    enabled: Boolean(productId),
  });

  // The proxy wraps the backend body in { data }; the backend may wrap the
  // product once more.
  const product = data?.data?.data ?? data?.data;
  const batches: ProductBatch[] = Array.isArray(product?.batches)
    ? product.batches
    : [];

  if (batches.length === 0) return null;

  const selected = batches.find((batch) => batch.id === value);

  return (
    <div className="flex-1 space-y-2">
      <label className="text-sm font-medium text-grey-1">
        {label} <span className="font-normal text-grey-3">(optional)</span>
      </label>
      <Select value={value || AUTO_BATCH} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Earliest expiry first" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AUTO_BATCH}>
            Earliest expiry first (automatic)
          </SelectItem>
          {batches.map((batch) => (
            <SelectItem key={batch.id} value={batch.id}>
              {/* Expired batches are in this list on purpose — writing them
                  off as waste is the main reason to pick a batch by hand. */}
              {batch.urgency === "EXPIRED" ? "⚠ EXPIRED · " : ""}
              {batch.batch_name} · {formatQty(batch.quantity)} left
              {batch.expiry_date
                ? ` · exp. ${moment(batch.expiry_date).format("D MMM YYYY")}`
                : ""}
              {variantName(batch) ? ` · ${variantName(batch)}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-grey-3">
        {selected
          ? `${variantName(selected) ? `${variantName(selected)} · ` : ""}${formatQty(selected.quantity)} units in this batch · ${expiryLabel(
              selected.days_until_expiry,
              selected.urgency,
            ).toLowerCase()}`
          : "Leave as is and the earliest-expiring batch is used."}
      </p>
    </div>
  );
};

export default BatchSelect;
