"use client";

import {
  useFetchPendingBnplQuery,
  type BnplStageFilter,
} from "@/api/business/pending-bnpl";
import { CustomTable } from "@/components/app/CutomTable";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import CollapsibleSection from "./CollapsibleSection";
import { pendingBnplColumns } from "./PendingBnplColumn";

/**
 * BNPL sales Akawopay has not settled yet.
 *
 * Deliberately its own flow rather than a filter on the wallet table: nothing
 * here is in the balance, and the goods are already gone. The panel used to
 * show three hardcoded zeros, which read as "no BNPL activity" to a merchant
 * who was in fact owed money.
 */

const STAGE_TABS: { key: BnplStageFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "awaiting_settlement", label: "Awaiting settlement" },
  { key: "processing_payout", label: "Processing payout" },
  { key: "failed_retrying", label: "Retrying" },
  { key: "settled", label: "Settled" },
];

const money = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return formatToNaira(Number.isFinite(parsed) ? parsed : 0);
};

const Tile = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) => (
  <div className="p-5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
      {label}
    </p>
    <p className={cn("mt-2 text-2xl font-extrabold text-grey-1", tone)}>
      {value}
    </p>
    {hint && <p className="mt-1 text-[11px] text-grey-3">{hint}</p>}
  </div>
);

const PendingBnplPanel = ({
  businessId,
  dateRange,
}: {
  businessId?: string;
  dateRange?: DateRange;
}) => {
  // "all" rather than no filter: omitting `stage` returns outstanding orders
  // only, so settled payouts would never appear on the tab that claims to show
  // everything.
  const [stage, setStage] = useState<BnplStageFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const asDate = (value?: Date) =>
    value ? value.toISOString().slice(0, 10) : undefined;

  const { data, isLoading, isError } = useFetchPendingBnplQuery({
    params: {
      businessId: businessId ?? "",
      stage,
      start_date: asDate(dateRange?.from),
      end_date: asDate(dateRange?.to),
      page,
      page_size: pageSize,
    },
  });

  // A filter or a new date range re-pages from the start; page 3 of the old
  // filter is usually past the end of the new one, which reads as "empty".
  useEffect(() => {
    setPage(1);
  }, [stage, dateRange?.from, dateRange?.to, pageSize]);

  const summary = data?.summary;
  const orders = data?.results ?? [];
  const breakdown = summary?.breakdown;
  const pendingCount = summary?.total_pending_orders ?? 0;
  const settledCount = summary?.total_settled_orders ?? 0;

  /**
   * Counts come off the breakdown, which the API totals over the whole date
   * range — so selecting one tab no longer zeroes the others.
   */
  const countFor = (key: BnplStageFilter) =>
    key === "all"
      ? pendingCount + settledCount
      : breakdown?.[key]?.count;

  /**
   * Settled money and outstanding money are different questions, so the tiles
   * answer whichever the open tab is asking. Mixing them into one row of
   * figures was the quickest way to have a merchant read money already spent
   * as money still coming.
   */
  const showingSettled = stage === "settled";

  return (
    <CollapsibleSection
      value="pending-bnpl"
      icon={<CreditCard className="h-5 w-5" />}
      title="Buy Now Pay Later"
      subtitle="Akawopay settlements on their way to your wallet"
      summary={
        // What a collapsed section is worth keeping open for: the amount owed.
        !isLoading && !isError ? (
          <>
            <p className="text-sm font-extrabold text-grey-1">
              {money(summary?.total_estimated_net)}
            </p>
            <p className="text-[11px] font-normal text-grey-3">
              {pendingCount} pending
            </p>
          </>
        ) : null
      }
    >
      <div className="grid grid-cols-1 border-b border-grey-5 sm:grid-cols-2 lg:grid-cols-4">
        {showingSettled ? (
          <>
            <Tile
              label="Settled orders"
              value={String(settledCount)}
              hint="Paid into your wallet"
            />
            <Tile
              label="Settled gross"
              value={money(summary?.total_settled_gross)}
              hint="What customers were charged"
            />
            <Tile
              label="Received"
              value={money(summary?.total_settled_net)}
              hint="After Akawopay's fee"
              tone="text-success-1"
            />
            <Tile
              label="Fees paid"
              value={money(summary?.total_settled_fees)}
              hint="Gateway deduction"
              tone="text-error-1"
            />
          </>
        ) : (
          <>
            <Tile
              label="Pending orders"
              value={String(pendingCount)}
              hint="Goods already released"
            />
            <Tile
              label="Pending gross"
              value={money(summary?.total_pending_gross)}
              hint="What customers were charged"
            />
            <Tile
              label="Expected in wallet"
              value={money(summary?.total_estimated_net)}
              hint="After Akawopay's fee"
              tone="text-success-1"
            />
            <Tile
              label="Fees"
              value={money(summary?.total_estimated_fees)}
              hint="Gateway deduction"
              tone="text-error-1"
            />
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 border-b border-grey-5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap gap-2">
          {STAGE_TABS.map((tab) => {
            const count = countFor(tab.key);
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStage(tab.key)}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-bold transition-colors",
                  stage === tab.key
                    ? "border-primary-green-300 bg-primary-green-300 text-white"
                    : "border-grey-5 text-grey-2 hover:bg-secondary-6",
                )}
              >
                {tab.label}
                {count !== undefined ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
        <Link
          href="/operations/general-settings"
          className="shrink-0 text-sm font-bold text-primary-green-300 hover:underline"
        >
          BNPL settings
        </Link>
      </div>

      {isError ? (
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-grey-2">
            Could not load pending BNPL settlements
          </p>
          <p className="mt-1 text-xs text-grey-3">
            Try again in a moment. Anything already settled still shows under
            Transactions.
          </p>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <CustomTable
            bordered={false}
            showSerialNumber={false}
            loading={isLoading}
            noDataText="Nothing waiting to be settled"
            columns={pendingBnplColumns}
            data={orders}
            pagination={{
              currentPage: page,
              totalPages: data?.pages || 1,
              pageSize,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </div>
      )}
    </CollapsibleSection>
  );
};

export default PendingBnplPanel;
