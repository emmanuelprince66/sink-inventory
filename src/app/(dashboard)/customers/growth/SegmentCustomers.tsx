"use client";

import { useFetchSegmentCustomersQuery } from "@/api/segment/fetch-segment-customers";
import { Spinner } from "@/components/app/Spinner";
import { toList } from "@/types/api";
import type { UserCustomer } from "@/types/segment";
import { useFormatMoney } from "@/utils/formatMoney";
import { MessageSquare, Pencil, Users } from "lucide-react";

const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

// The segment list endpoint only returns customer_count, so revenue and average
// spend are derived here from the customers themselves rather than shown as
// placeholders on the cards.
const SegmentCustomers = ({
  segmentId,
  onEditConditions,
  onMessage,
}: {
  segmentId: string;
  /** Opens the segment's own edit form — the conditions live there. */
  onEditConditions?: () => void;
  /**
   * Starts an outreach campaign against exactly these customers. Receives the
   * ids rather than fetching them again: this component already holds the
   * resolved membership, and re-querying could return a different set if the
   * segment is recomputed between the two calls.
   */
  onMessage?: (customerIds: string[]) => void;
}) => {
  const formatMoney = useFormatMoney();
  const { data, isLoading } = useFetchSegmentCustomersQuery({
    params: { segmentId },
  });

  const customers = toList<UserCustomer>(data?.data as never);

  // Campaigns are addressed by customer id, so anyone the segment matched
  // without one cannot be messaged and is dropped from the audience.
  const messageableIds = customers
    .map((c) => c.id)
    .filter((id): id is string => Boolean(id));

  const revenue = customers.reduce(
    (sum, c) => sum + Number(c.total_sales ?? 0),
    0,
  );
  const avgSpend = customers.length ? revenue / customers.length : 0;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-16">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions sit above the figures: both act on the segment as a whole,
          not on any one customer in the list below. */}
      {(onEditConditions || onMessage) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {onEditConditions && (
            <button
              onClick={onEditConditions}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-grey-5 bg-white text-sm font-bold text-grey-1 hover:bg-grey-6 cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Conditions
            </button>
          )}
          {onMessage && (
            <button
              onClick={() => onMessage(messageableIds)}
              disabled={messageableIds.length === 0}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary-green-300 text-sm font-bold text-white hover:bg-primary-green-300/90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message {messageableIds.length || ""} Customer
              {messageableIds.length === 1 ? "" : "s"}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          { value: String(customers.length), label: "Customers" },
          { value: formatMoney(revenue), label: "Revenue" },
          { value: formatMoney(avgSpend), label: "Avg Spend" },
        ].map((stat) => (
          <div key={stat.label} className="bg-grey-6 rounded-xl py-3 text-center">
            <p className="text-sm font-extrabold text-grey-1">{stat.value}</p>
            <p className="text-[10px] text-grey-3">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-grey-5">
          <Users className="w-4 h-4 text-primary-green-300" />
          <h4 className="text-sm font-extrabold text-grey-1">
            Customers ({customers.length})
          </h4>
        </div>

        {customers.length === 0 ? (
          <p className="text-sm text-grey-3 text-center py-10">
            No customers currently match this segment.
          </p>
        ) : (
          customers.map((c) => (
            <div
              key={c.id ?? c.phone}
              className="flex items-center justify-between gap-3 px-4 py-3 border-b border-grey-6 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 shrink-0 rounded-full bg-grey-6 text-grey-2 flex items-center justify-center text-[11px] font-extrabold">
                  {initials(c.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-grey-1 truncate">
                    {c.name}
                  </p>
                  <p className="text-[11px] text-grey-3 truncate">
                    {c.phone}
                    {c.email ? ` · ${c.email}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-grey-1">
                  {formatMoney(Number(c.total_sales ?? 0))}
                </p>
                <p className="text-[11px] text-grey-3">
                  {Number(c.sales_count ?? 0)} orders
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SegmentCustomers;
