"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  TRANSACTION_FLOWS,
  TRANSACTION_TYPES,
  type CustomerTransactionType,
  type TransactionFlow,
} from "@/types/customerTransaction";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TransactionRow from "./TransactionRow";
import { typeMeta } from "./transactionMeta";
import type { CustomerTransactionsApi } from "./useCustomerTransactions";

/**
 * Mirrors the loaded layout — two filter rows, five rows — so the section does
 * not jump when data lands. A centred spinner gave no sense of what was coming
 * and collapsed it to a fraction of its real height.
 */
const TransactionsSkeleton = () => (
  <div className="flex w-full min-w-0 flex-col gap-4">
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {[56, 76, 64, 56, 68, 72].map((w, i) => (
          <Skeleton
            key={i}
            className="h-7 rounded-full bg-grey-5"
            style={{ width: w }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[104, 80, 84].map((w, i) => (
          <Skeleton
            key={i}
            className="h-7 rounded-full bg-grey-5"
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[68px] rounded-xl bg-grey-5" />
      ))}
    </div>
  </div>
);

const Pill = ({
  active,
  activeClass = "bg-primary-green-300 text-white",
  onClick,
  children,
}: {
  active: boolean;
  /** Colour when selected — each filter wears the tone of what it selects. */
  activeClass?: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer",
      active
        ? activeClass
        : "border border-grey-5 bg-white text-grey-3 hover:border-grey-4 hover:text-grey-1",
    )}
  >
    {children}
  </button>
);

/**
 * The customer's transaction ledger — filters, rows and paging only.
 *
 * It used to be its own profile tab with a strip of summary tiles above it; it
 * now renders at the foot of the Financial tab, and every figure those tiles
 * carried is printed once in All Financial Details instead. The query lives in
 * FinancialTab and arrives here as `api`, so the tab and the ledger read one
 * summary rather than firing the request twice.
 */
const TransactionsTab = ({ api }: { api: CustomerTransactionsApi }) => {
  const {
    rows,
    total,
    pages,
    page,
    setPage,
    type,
    changeType,
    flow,
    changeFlow,
    isLoading,
    isFetching,
    hasFilters,
  } = api;

  if (isLoading) return <TransactionsSkeleton />;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TRANSACTION_TYPES.map((option) => (
            <Pill
              key={option}
              active={type === option}
              activeClass={
                option === "ALL" ? undefined : typeMeta(option).pillActive
              }

              onClick={() => changeType(option as CustomerTransactionType)}
            >
              {option === "ALL" ? "All" : typeMeta(option).label}
            </Pill>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Pill active={!flow} onClick={() => changeFlow(undefined)}>
            Both directions
          </Pill>
          {TRANSACTION_FLOWS.map((option) => (
            <Pill
              key={option}
              active={flow === option}
              activeClass={
                option === "INFLOW"
                  ? "bg-success-1 text-white"
                  : "bg-error-1 text-white"
              }
              onClick={() => changeFlow(option as TransactionFlow)}
            >
              {option === "INFLOW" ? "Money in" : "Money out"}
            </Pill>
          ))}
        </div>
      </div>

      {/* Rows — dimmed while refetching so paging keeps its place instead of
          collapsing back to a spinner. */}
      <div
        className={cn(
          "flex flex-col gap-2 transition-opacity",
          isFetching && "opacity-60",
        )}
      >
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-grey-3">
            {hasFilters
              ? "No transactions match these filters."
              : "This customer has no transactions yet."}
          </p>
        ) : (
          rows.map((row) => <TransactionRow key={row.id} row={row} />)
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-grey-3">
            Page {page} of {pages} · {total} transactions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-9 gap-1 rounded-xl text-xs"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-1 rounded-xl text-xs"
              disabled={page >= pages || isFetching}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;
