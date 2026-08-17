"use client";

import DataGapBadge from "@/components/app/DataGapBadge";
import { CreditCard, Wallet } from "lucide-react";
import { Cell } from "./primitives";
import type { CustomerProfileData } from "./useCustomerProfile";

const FinancialTab = ({ profile }: { profile: CustomerProfileData }) => {
  const { financial, formatMoney } = profile;
  const money = (value: string | number | undefined | null) =>
    formatMoney(Number(value ?? 0));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Wallet */}
        <div className="rounded-2xl border border-grey-5 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-green-500 text-primary-green-300">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-bold text-grey-2">Wallet Balance</p>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-grey-1 break-words">
            {money(financial?.wallet_balance)}
          </p>
          <div className="mt-3 border-t border-grey-6 pt-3">
            <p className="text-[10px] text-grey-3">Credit Balance</p>
            <p className="mt-0.5 text-sm font-extrabold text-info-1">
              {money(financial?.credit_balance)}
            </p>
          </div>
        </div>

        {/* BNPL — no fields for this in the payload yet. */}
        <div className="rounded-2xl border border-grey-5 bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-info-2 text-info-1">
              <CreditCard className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-bold text-grey-2">BNPL Status</p>
            <DataGapBadge
              label="No BNPL data"
              needs="GET /customer/{id}/ — financial_details has no BNPL fields. Needed: bnpl_status (Active/Inactive), credit_limit and avg_repayment_time, which the Financial tab design shows."
            />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-grey-4">—</p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-grey-6 pt-3">
            <div className="min-w-0">
              <p className="text-[10px] text-grey-3">Outstanding</p>
              <p className="mt-0.5 text-sm font-extrabold text-grey-1 break-words">
                {money(financial?.outstanding_balance)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-grey-3">Repayment</p>
              <p className="mt-0.5 text-sm font-extrabold text-grey-4">—</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-grey-5 bg-white p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
          All Financial Details
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Cell
            label="Wallet Balance"
            value={money(financial?.wallet_balance)}
            tone="text-primary-green-300"
          />
          <Cell
            label="Credit Balance"
            value={money(financial?.credit_balance)}
            tone="text-info-1"
          />
          {/* Nulls here are honest: the payload has no field for them. */}
          <Cell label="Credit Limit" value={null} />
          <Cell
            label="Outstanding Balance"
            value={money(financial?.outstanding_balance)}
          />
          <Cell label="BNPL Usage" value={null} />
          <Cell label="Avg Repayment Time" value={null} />
          <Cell
            label="Total Lifetime Spend"
            value={money(financial?.total_lifetime_spend)}
            tone="text-primary-green-300"
          />
          <Cell
            label="Avg Basket Size"
            value={money(financial?.avg_basket_size)}
            tone="text-info-1"
          />
          <Cell label="Total Orders" value={financial?.total_orders} />
          <Cell
            label="Cashback Earned"
            value={money(financial?.cashback_earned)}
            tone="text-primary-green-300"
          />
        </div>
      </div>
    </>
  );
};

export default FinancialTab;
