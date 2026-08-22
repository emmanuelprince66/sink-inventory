"use client";

import { useFetchCustomerPurchaseHistory } from "@/api/customer/fetch-customer-purchase-history";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import { useFormatMoney } from "@/utils/formatMoney";
import { Receipt } from "lucide-react";
import { useState } from "react";

/**
 * A customer's sales, from GET /customer/purchase_history/{id}/.
 *
 * Distinct from the Transactions tab, which merges five event kinds into one
 * ledger — this is purchases alone, with the per-sale detail that view has no
 * room for: the items, the tax, what a loyalty reward took off, and what is
 * still owed.
 */

/** Present-but-null is the norm on this payload, so absence is not enough. */
const has = (value: unknown) => value !== null && value !== undefined;
const hasAmount = (value: unknown) => has(value) && Number(value) !== 0;

const shortDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

const titleCase = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");

const PurchaseRow = ({ sale }: { sale: any }) => {
  const formatMoney = useFormatMoney();
  const [open, setOpen] = useState(false);

  // products is a summary string; items is the structured list. Either may be
  // absent depending on how the sale was recorded.
  const items: any[] = Array.isArray(sale.items) ? sale.items : [];
  const isPaid = (sale.payment_status ?? "").toUpperCase() === "PAID";
  const owing = Number(sale.balance ?? 0) > 0;

  const expandable =
    items.length > 0 ||
    has(sale.products) ||
    hasAmount(sale.total_tax) ||
    hasAmount(sale.loyalty_discount);

  return (
    <div className="rounded-xl border border-grey-5 bg-white">
      <button
        type="button"
        onClick={() => expandable && setOpen((v) => !v)}
        className={cn(
          "flex w-full min-w-0 items-start gap-3 p-3 text-left",
          expandable && "cursor-pointer hover:bg-grey-6/40",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-6 text-primary-green-300">
          <Receipt className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-bold text-grey-1">
              {sale.reference || "Sale"}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                isPaid
                  ? "bg-success-2 text-success-1"
                  : "bg-warning-2 text-warning-1",
              )}
            >
              {titleCase(sale.payment_status ?? "Unpaid")}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-grey-3">
            {[
              sale.channel && titleCase(sale.channel),
              sale.method && titleCase(sale.method),
              shortDateTime(sale.created_at),
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span className="block whitespace-nowrap text-sm font-extrabold text-grey-1">
            {formatMoney(Number(sale.total_price ?? 0))}
          </span>
          {owing && (
            <span className="block whitespace-nowrap text-[10px] font-bold text-error-1">
              {formatMoney(Number(sale.balance))} owing
            </span>
          )}
        </span>
      </button>

      {open && expandable && (
        <div className="border-t border-grey-6 px-3 py-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sale.attendance && (
              <div className="min-w-0">
                <p className="text-[10px] text-grey-3">Attendant</p>
                <p className="truncate text-xs font-bold text-grey-1">
                  {sale.attendance}
                </p>
              </div>
            )}
            {hasAmount(sale.total_tax) && (
              <div className="min-w-0">
                <p className="text-[10px] text-grey-3">Tax</p>
                <p className="truncate text-xs font-bold text-grey-1">
                  {formatMoney(Number(sale.total_tax))}
                </p>
              </div>
            )}
            {hasAmount(sale.loyalty_discount) && (
              <div className="min-w-0">
                <p className="text-[10px] text-grey-3">Loyalty discount</p>
                <p className="truncate text-xs font-bold text-violet-700">
                  −{formatMoney(Number(sale.loyalty_discount))}
                </p>
              </div>
            )}
            {sale.loyalty_reward_applied && (
              <div className="min-w-0">
                <p className="text-[10px] text-grey-3">Reward used</p>
                <p className="truncate text-xs font-bold text-violet-700">
                  {String(sale.loyalty_reward_applied)}
                </p>
              </div>
            )}
            {sale.due_date && (
              <div className="min-w-0">
                <p className="text-[10px] text-grey-3">Due</p>
                <p className="truncate text-xs font-bold text-grey-1">
                  {new Date(sale.due_date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {items.length > 0 ? (
            <div className="mt-3 flex flex-col gap-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg bg-grey-6/60 px-2.5 py-1.5"
                >
                  <span className="min-w-0 truncate text-xs text-grey-2">
                    {item.name ?? item.product_name ?? "Item"}
                    {item.quantity ? ` × ${item.quantity}` : ""}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {item.is_loyalty_reward && (
                      <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                        Reward
                      </span>
                    )}
                    {has(item.total_price) && (
                      <span className="text-xs font-bold text-grey-1">
                        {formatMoney(Number(item.total_price))}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            // Older sales carry only the summary string, not the item list.
            has(sale.products) && (
              <p className="mt-3 rounded-lg bg-grey-6/60 px-2.5 py-1.5 text-xs text-grey-2">
                {String(sale.products)}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
};

const PurchaseHistoryList = ({ id }: { id: string }) => {
  const { data, isLoading } = useFetchCustomerPurchaseHistory(id);

  // The envelope has moved shape before, so normalise rather than assume.
  const sales = toList<any>(data?.data ?? data);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[68px] rounded-xl bg-grey-5" />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-grey-3">
        No purchases recorded for this customer yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sales.map((sale, index) => (
        <PurchaseRow key={sale.id ?? index} sale={sale} />
      ))}
    </div>
  );
};

export default PurchaseHistoryList;
