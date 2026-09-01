"use client";

import { cn } from "@/lib/utils";
import { useFormatMoney, getCurrencySymbol } from "@/utils/formatMoney";
import { ShoppingBag, Users, Wallet } from "lucide-react";
import type { CustomerSummary } from "./types";

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
  align?: "left" | "center" | "right";
}) => (
  <div
    className={
      align === "right" ? "text-right" : align === "center" ? "text-center" : ""
    }
  >
    <p className="text-[10px] text-grey-3">{label}</p>
    <p className={cn("text-xs font-extrabold mt-0.5", tone)}>{value}</p>
  </div>
);

// Every figure here comes straight from the list endpoint's summary block —
// nothing is derived client-side and nothing is borrowed from the analytics
// dashboard, both of which this component used to do.
const CustomerSummaryCards = ({ summary }: { summary?: CustomerSummary }) => {
  const formatMoney = useFormatMoney();

  // Currency symbol from the shared helper, so a non-NGN business is not
  // hardcoded into the compact figures.
  const symbol = getCurrencySymbol();

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
            value={String(summary?.credit_customers_count ?? 0)}
            tone="text-info-1"
            align="right"
          />
        </div>
      </div>

      {/* Spend & basket */}
      <div className="bg-white rounded-2xl border border-grey-5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-7 h-7 rounded-full bg-warning-2 text-warning-1 flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5" />
          </span>
          <p className="text-xs font-bold text-grey-2">
            Total Spend &amp; Basket
          </p>
        </div>
        <p className="text-2xl font-extrabold text-grey-1">
          {compact(Number(summary?.total_spend ?? 0), symbol)}
        </p>
        <div className="flex items-center justify-between mt-3">
          <Stat
            label="Avg Basket"
            value={formatMoney(Number(summary?.avg_basket ?? 0))}
            tone="text-info-1"
          />
          <Stat
            label="Avg LTV"
            value={formatMoney(Number(summary?.avg_ltv ?? 0))}
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
        <p className="text-2xl font-extrabold text-white">
          {summary?.customer_count ?? 0}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-[10px] text-white/50">Active</p>
            <p className="text-xs font-extrabold text-primary-green-300 mt-0.5">
              {summary?.active_customers ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-white/50">At Risk</p>
            <p className="text-xs font-extrabold text-warning-1 mt-0.5">
              {summary?.at_risk_customers ?? 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/50">New</p>
            <p className="text-xs font-extrabold text-info-1 mt-0.5">
              +{summary?.new_customers ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSummaryCards;
