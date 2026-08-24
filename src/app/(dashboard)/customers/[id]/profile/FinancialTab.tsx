"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet } from "lucide-react";
import { useCallback, useState } from "react";
import UpdateCustomerWallet from "../UpdateCustomerWallet";
import { Cell } from "./primitives";
import TransactionsTab from "./TransactionsTab";
import type { CustomerProfileData } from "./useCustomerProfile";
import { useCustomerTransactions } from "./useCustomerTransactions";

// BNPL was shown here as an empty card — the payload has no bnpl_status,
// credit_limit or avg_repayment_time to fill it. Commented out rather than
// deleted so it can come back with the fields; see the block below.
// import DataGapBadge from "@/components/app/DataGapBadge";
// import { CreditCard } from "lucide-react";

const FinancialTab = ({
  profile,
  id,
}: {
  profile: CustomerProfileData;
  id: string;
}) => {
  const { financial, formatMoney } = profile;
  const money = (value: string | number | undefined | null) =>
    formatMoney(Number(value ?? 0));

  // The ledger query lives here rather than inside TransactionsTab: its
  // summary carries the money-movement totals printed in All Financial
  // Details below, and one instance keeps those totals and the rows in step.
  const ledger = useCustomerTransactions(id);
  const { summary } = ledger;

  const queryClient = useQueryClient();
  const [fundWalletOpen, setFundWalletOpen] = useState(false);

  // UpdateCustomerWallet refetches the customer detail itself, which is what
  // feeds the balances above. The ledger below runs its own query, so drop it
  // too — otherwise a deposit shows in the balance but not in the list.
  const closeFundWallet = useCallback(() => {
    setFundWalletOpen(false);
    queryClient.invalidateQueries({
      queryKey: [queryKey.customers.getCustomerTransactions],
    });
  }, [queryClient]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Wallet */}
        <div className="rounded-2xl border border-grey-5 bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-green-500 text-primary-green-300">
                <Wallet className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-bold text-grey-2">Wallet Balance</p>
            </div>
            <Button
              size="sm"
              className="h-8 gap-1 rounded-lg text-xs"
              onClick={() => setFundWalletOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Fund Wallet
            </Button>
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

        {/* Outstanding — the second half of the row now that BNPL is hidden. */}
        <div className="rounded-2xl border border-grey-5 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-info-2 text-info-1">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-bold text-grey-2">
              Outstanding Balance
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-grey-1 break-words">
            {money(financial?.outstanding_balance)}
          </p>
          <div className="mt-3 border-t border-grey-6 pt-3">
            <p className="text-[10px] text-grey-3">Total Lifetime Spend</p>
            <p className="mt-0.5 text-sm font-extrabold text-primary-green-300">
              {money(financial?.total_lifetime_spend)}
            </p>
          </div>
        </div>

        {/* BNPL Status — hidden until the payload carries the fields.
            GET /customer/{id}/ → financial_details needs bnpl_status
            (Active/Inactive), credit_limit and avg_repayment_time. */}
        {/* <div className="rounded-2xl border border-grey-5 bg-white p-4">
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
        </div> */}
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
          {/* BNPL Usage and Avg Repayment Time hidden with the BNPL card. */}
          {/* <Cell label="BNPL Usage" value={null} /> */}
          {/* <Cell label="Avg Repayment Time" value={null} /> */}
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

          {/* Money movement, from the ledger's summary — these four used to be
              tiles above the transaction list. They are not spend figures: a
              deposit and a purchase both move money, only one is spending. */}
          <Cell
            label="Total Funded"
            value={summary ? money(summary.total_funded) : null}
            tone="text-primary-green-300"
          />
          <Cell
            label="Total Withdrawn"
            value={summary ? money(summary.total_withdrawn) : null}
          />
          <Cell
            label="Repayments"
            value={summary ? money(summary.total_repayments) : null}
          />
          <Cell
            label="Total Transactions"
            value={summary?.total_transactions ?? null}
            tone="text-info-1"
          />
        </div>
      </div>

      {/* Transaction ledger — its own tab until now, merged in here so the
          movements sit with the balances they explain. */}
      <div className="rounded-2xl border border-grey-5 bg-white p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Transaction History
        </p>
        <TransactionsTab api={ledger} />
      </div>

      <CustomModal
        isOpen={fundWalletOpen}
        onClose={closeFundWallet}
        trigger={false}
        title="Fund Wallet"
      >
        {/* Mounted only while open — UpdateCustomerWallet's hook fires the
            customer, purchase-history and wallet-transaction queries. */}
        {fundWalletOpen && (
          <UpdateCustomerWallet
            wallet={money(financial?.wallet_balance)}
            closeModal={closeFundWallet}
          />
        )}
      </CustomModal>
    </>
  );
};

export default FinancialTab;
