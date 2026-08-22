"use client";

import { cn } from "@/lib/utils";
import type { CustomerTransactionItem } from "@/types/customerTransaction";
import { useFormatMoney } from "@/utils/formatMoney";
import { useState } from "react";
import { STATUS_TONES, titleCase, typeMeta } from "./transactionMeta";

/**
 * The API sends every details key on every row and nulls the ones that do not
 * apply, so presence means nothing — `initial_balance: null` on a purchase
 * would pass an `!== undefined` check and print "Before: N0.00". `has` treats
 * null and undefined alike, and the money/count helpers additionally drop
 * zeroes, which are real values but not worth a line on a row where the field
 * is irrelevant.
 */
const has = (value: unknown) => value !== null && value !== undefined;
const hasAmount = (value: unknown) => has(value) && Number(value) !== 0;

const TransactionRow = ({ row }: { row: CustomerTransactionItem }) => {
  const formatMoney = useFormatMoney();
  const [open, setOpen] = useState(false);

  const meta = typeMeta(row.type);

  const isInflow = row.flow === "INFLOW";
  const d = row.details ?? {};

  // Only the fields this row's type actually carries. Everything on details is
  // optional, so each is checked rather than assumed present.
  const facts: Array<{ label: string; value: string }> = [];
  if (d.channel) facts.push({ label: "Channel", value: d.channel });
  if (row.payment_method)
    facts.push({ label: "Method", value: titleCase(row.payment_method) });
  if (has(d.items_count))
    facts.push({ label: "Items", value: String(d.items_count) });
  if (hasAmount(d.total_tax))
    facts.push({ label: "Tax", value: formatMoney(d.total_tax!) });
  if (hasAmount(d.loyalty_discount))
    facts.push({
      label: "Loyalty discount",
      value: formatMoney(d.loyalty_discount!),
    });
  if (has(d.initial_balance))
    facts.push({ label: "Before", value: formatMoney(d.initial_balance!) });
  if (has(d.new_balance))
    facts.push({ label: "After", value: formatMoney(d.new_balance!) });
  if (d.bank_name) facts.push({ label: "Bank", value: d.bank_name });
  if (hasAmount(d.balance_outstanding))
    facts.push({
      label: "Outstanding",
      value: formatMoney(d.balance_outstanding!),
    });
  if (d.sale_reference)
    facts.push({ label: "Against sale", value: d.sale_reference });
  if (d.due_date)
    facts.push({
      label: "Due",
      value: new Date(d.due_date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    });
  if (d.program_name) facts.push({ label: "Programme", value: d.program_name });
  if (d.reward_type)
    facts.push({ label: "Reward", value: titleCase(d.reward_type) });
  if (d.referred_customer_name)
    facts.push({ label: "Referred", value: d.referred_customer_name });
  if (d.note) facts.push({ label: "Note", value: d.note });
  if (row.attendant) facts.push({ label: "Attendant", value: row.attendant });

  const expandable = facts.length > 0 || (d.items?.length ?? 0) > 0;

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
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            meta.tone,
          )}
        >
          {meta.icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-bold text-grey-1">
              {row.title}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                STATUS_TONES[row.status] ?? "bg-grey-6 text-grey-3",
              )}
            >
              {titleCase(row.status)}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-grey-3">
            {meta.label}
            {row.reference ? ` · ${row.reference}` : ""} ·{" "}
            {new Date(row.created_at).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </span>

        {/* Sign comes from flow, not from the amount: the API sends amounts
            unsigned, so a refund and a purchase would otherwise look alike. */}
        <span
          className={cn(
            "shrink-0 whitespace-nowrap text-sm font-extrabold",
            isInflow ? "text-success-1" : "text-grey-1",
          )}
        >
          {isInflow ? "+" : "−"}
          {formatMoney(Math.abs(Number(row.amount ?? 0)))}
        </span>
      </button>

      {open && expandable && (
        <div className="border-t border-grey-6 px-3 py-3">
          {facts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <p className="text-[10px] text-grey-3">{fact.label}</p>
                  <p className="truncate text-xs font-bold text-grey-1">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {(d.items?.length ?? 0) > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                Items
              </p>
              <div className="mt-1.5 flex flex-col gap-1">
                {d.items!.map((item, index) => (
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionRow;
