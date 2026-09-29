"use client";

import { useFetchSegmentCustomersQuery } from "@/api/segment/fetch-segment-customers";
import { Spinner } from "@/components/app/Spinner";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import type { CustomerSegment, UserCustomer } from "@/types/segment";
import { Cake, Gift, Pencil } from "lucide-react";
import {
  countdownLabel,
  countdownTone,
  customerMonthDayLabel,
  daysToBirthday,
  windowDays,
  windowLabel,
} from "./birthday";

const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

/**
 * The BIRTHDAY segment's own view. Spend figures mean nothing for "whose
 * birthday is coming up", so this swaps them for what the merchant acts on:
 * who, when, how long until, and a per-customer "Send offer".
 */
const BirthdayCustomers = ({
  segment,
  onEditConditions,
  onSendOffer,
}: {
  segment: CustomerSegment;
  onEditConditions?: () => void;
  /**
   * Opens a campaign for these customers. `name` is passed for a single
   * recipient so the pre-filled message can greet them by name.
   */
  onSendOffer?: (customerIds: string[], name?: string) => void;
}) => {
  const { data, isLoading } = useFetchSegmentCustomersQuery({
    params: { segmentId: segment.id ?? "" },
  });

  // Soonest first; anyone without a usable date sinks to the bottom.
  const customers = toList<UserCustomer>(data?.data as never)
    .map((customer) => ({ customer, days: daysToBirthday(customer) }))
    .sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity));

  const offerableIds = customers
    .map(({ customer }) => customer.id)
    .filter((id): id is string => Boolean(id));

  const today = customers.filter(({ days }) => days === 0).length;
  const thisWeek = customers.filter(
    ({ days }) => days !== null && days <= 7,
  ).length;

  const label = windowLabel(segment);
  const span = windowDays(segment);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-16">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* The window this list covers, and the bulk action for all of it. */}
      <div className="flex flex-col gap-3 rounded-2xl bg-pink-50 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 shrink-0 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
            <Cake className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-grey-1 truncate">
              {label ?? "Upcoming birthdays"}
            </p>
            <p className="text-[11px] text-grey-3">
              {span ? `Birthdays in the next ${span} days` : "Upcoming birthdays"}
            </p>
          </div>
        </div>
        {onSendOffer && (
          <button
            onClick={() => onSendOffer(offerableIds)}
            disabled={offerableIds.length === 0}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary-green-300 px-4 text-sm font-bold text-white hover:bg-primary-green-300/90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Gift className="h-3.5 w-3.5" />
            Send offer to all
            {offerableIds.length ? ` (${offerableIds.length})` : ""}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { value: today, label: "Today" },
          { value: thisWeek, label: "Next 7 Days" },
          { value: customers.length, label: "In Window" },
        ].map((stat) => (
          <div key={stat.label} className="bg-grey-6 rounded-xl py-3 text-center">
            <p className="text-sm font-extrabold text-grey-1">{stat.value}</p>
            <p className="text-[10px] text-grey-3">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        {/* Column headings only where the row actually lays out as columns. */}
        <div className="hidden md:grid grid-cols-[1fr_80px_100px_112px] items-center gap-3 px-4 py-2.5 border-b border-grey-5 bg-grey-6/50 text-[11px] font-bold text-grey-3">
          <span>Customer</span>
          <span>Birthday</span>
          <span>Countdown</span>
          <span />
        </div>

        {customers.length === 0 ? (
          <p className="text-sm text-grey-3 text-center py-10 px-4">
            No birthdays {label ? `between ${label}` : "coming up"}. Customers
            appear here once their date of birth is on file.
          </p>
        ) : (
          customers.map(({ customer, days }) => (
            <div
              key={customer.id ?? customer.phone}
              className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_80px_100px_112px] items-center gap-x-3 gap-y-2 px-4 py-3 border-b border-grey-6 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 shrink-0 rounded-full bg-grey-6 text-grey-2 flex items-center justify-center text-[11px] font-extrabold">
                  {initials(customer.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-grey-1 truncate">
                    {customer.name}
                  </p>
                  <p className="text-[11px] text-grey-3 truncate">
                    {customer.phone}
                    {/* On mobile the date column folds into this line. */}
                    <span className="md:hidden">
                      {customerMonthDayLabel(customer)
                        ? ` · ${customerMonthDayLabel(customer)}`
                        : ""}
                    </span>
                  </p>
                </div>
              </div>

              <p className="hidden md:block text-sm font-bold text-grey-1">
                {customerMonthDayLabel(customer) ?? "—"}
              </p>

              <span
                className={cn(
                  "justify-self-end md:justify-self-start whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded-full",
                  countdownTone(days),
                )}
              >
                {days === 0 && "🎂 "}
                {countdownLabel(days)}
              </span>

              {onSendOffer && (
                <button
                  onClick={() =>
                    customer.id && onSendOffer([customer.id], customer.name)
                  }
                  disabled={!customer.id}
                  className="col-span-2 md:col-span-1 flex h-8 items-center justify-center gap-1.5 rounded-lg border border-pink-200 bg-white px-3 text-xs font-bold text-pink-700 hover:bg-pink-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Gift className="h-3.5 w-3.5" />
                  Send offer
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {onEditConditions && (
        <button
          onClick={onEditConditions}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-grey-5 bg-white text-sm font-bold text-grey-1 hover:bg-grey-6 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          Change window
        </button>
      )}
    </div>
  );
};

export default BirthdayCustomers;
