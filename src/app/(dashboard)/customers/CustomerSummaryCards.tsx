"use client";

import { useFetchCustomerDashboardQuery } from "@/api/customer-analytics/fetch-customer-dashboard";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { useFormatMoney } from "@/utils/formatMoney";
import { Users, Wallet } from "lucide-react";
import type { CustomerSummary, CustomerType } from "./types";

/** Compact money for headline figures — ₦669K rather than ₦669,000. */
const compact = (amount: number, symbol: string) => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol}${Math.round(amount / 1_000)}K`;
  return `${symbol}${Math.round(amount).toLocaleString()}`;
};

const Stat = ({
  label,
  value,
  tone,
  align = "left",
}: {
  label: string;
  value: string;
  tone: string;
  align?: "left" | "right";
}) => (
  <div className={align === "right" ? "text-right" : ""}>
    <p className="text-[10px] text-grey-3">{label}</p>
    <p className={cn("text-xs font-extrabold mt-0.5", tone)}>{value}</p>
  </div>
);

const CustomerSummaryCards = ({
  summary,
  customers,
}: {
  summary?: CustomerSummary;
  customers: CustomerType[];
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const formatMoney = useFormatMoney();

  // Active / At Risk / New come from the analytics dashboard — the customer
  // list itself carries no status, so the dark card is stitched from both.
  const { data: dashboardRes } = useFetchCustomerDashboardQuery({
    params: { id: business_id ?? "" },
  });
  const overview = dashboardRes?.data?.overview;

  // Naira symbol from the shared formatter so a non-NGN business is not
  // hardcoded into the compact figures.
  const symbol = formatMoney(0).replace(/[\d.,\s]/g, "") || "₦";

  const totalSpend = customers.reduce(
    (sum, c) => sum + Number(c.total_sales ?? 0),
    0,
  );
  const totalOrders = customers.reduce(
    (sum, c) => sum + Number(c.sales_count ?? 0),
    0,
  );
  const customerCount = summary?.customer_count ?? customers.length;

  const avgBasket = totalOrders > 0 ? totalSpend / totalOrders : 0;
  const avgLtv = customerCount > 0 ? totalSpend / customerCount : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Wallet & credit */}
      <div className="bg-white rounded-2xl border border-grey-5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-7 h-7 rounded-full bg-primary-green-500 text-primary-green-300 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5" />
          </span>
          <p className="text-xs font-bold text-grey-2">
            Wallet &amp; Credit Balance
          </p>
        </div>
        <p className="text-2xl font-extrabold text-grey-1">
          {formatMoney(Number(summary?.total_wallet ?? 0))}
        </p>
        <div className="flex items-center justify-between mt-3">
          <Stat
            label="Credit Balance"
            value={formatMoney(Number(summary?.total_debt ?? 0))}
            tone="text-info-1"
          />
          <Stat
            label="Customers"
            value={String(customerCount)}
            tone="text-info-1"
            align="right"
          />
        </div>
      </div>

      {/* Spend & basket */}
      <div className="bg-white rounded-2xl border border-grey-5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-7 h-7 rounded-full bg-warning-2 text-warning-1 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path d="M3 3h2l2.4 12h9.2L19 7H6" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
            </svg>
          </span>
          <p className="text-xs font-bold text-grey-2">Total Spend &amp; Basket</p>
        </div>
        <p className="text-2xl font-extrabold text-grey-1">
          {compact(totalSpend, symbol)}
        </p>
        <div className="flex items-center justify-between mt-3">
          <Stat
            label="Avg Basket"
            value={formatMoney(avgBasket)}
            tone="text-info-1"
          />
          <Stat
            label="Avg LTV"
            value={formatMoney(avgLtv)}
            tone="text-primary-green-300"
            align="right"
          />
        </div>
      </div>

      {/* Total customers — the dark card in the design */}
      <div className="bg-grey-1 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </span>
          <p className="text-xs font-bold text-white/70">Total Customers</p>
        </div>
        <p className="text-2xl font-extrabold text-white">{customerCount}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-[10px] text-white/50">Active</p>
            <p className="text-xs font-extrabold text-primary-green-300 mt-0.5">
              {Math.round(Number(overview?.active_customers?.value ?? 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/50">At Risk</p>
            <p className="text-xs font-extrabold text-warning-1 mt-0.5">
              {Math.round(Number(overview?.churn_rate?.value ?? 0) > 0
                ? (customerCount *
                    Number(overview?.churn_rate?.value ?? 0)) /
                    100
                : 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/50">New</p>
            <p className="text-xs font-extrabold text-info-1 mt-0.5">
              +{Math.round(Number(overview?.new_this_month?.value ?? 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSummaryCards;
