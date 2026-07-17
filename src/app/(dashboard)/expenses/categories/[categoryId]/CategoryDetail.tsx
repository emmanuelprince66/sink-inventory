"use client";

import CustomPagination from "@/components/app/CustomPagination";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import { StatCardSkeletonRow } from "@/components/app/StatCardSkeleton";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useExpenseCategoryDetail } from "@/hooks/useExpenseAccountsHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowLeft,
  CalendarRange,
  ChevronRight,
  FilterX,
  Inbox,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import SetCategoryBudgetModal from "../../expense-accounts/SetCategoryBudgetModal";
import TransactionDetailsModal from "../../expense-accounts/TransactionDetailsModal";
import {
  getRefLabel,
  unwrapPaginated,
} from "../../expense-accounts/expense-ui-meta";

interface CategoryDetailProps {
  categoryId: string;
}

const PAGE_SIZE = 10;

// The endpoint defaults to a today-only window when start/end are omitted
// (confirmed live — `period.result_count` came back 0 with an empty
// `transactions` array for a category that actually has 13 logged
// expenses). Seed a real window so the table isn't empty on first load.
const defaultDateRange = (): DateRange => ({
  from: moment().subtract(6, "months").startOf("day").toDate(),
  to: moment().endOf("day").toDate(),
});

const CategoryDetail = ({ categoryId }: CategoryDetailProps) => {
  const router = useRouter();

  // Filters
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultDateRange,
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  // Modals
  const [openBudgetEdit, setOpenBudgetEdit] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);

  // Dedicated category-detail endpoint — returns this category's card stats
  // (results.summary) and its date-scoped transaction table
  // (results.transactions) in one call. Confirmed shape:
  // results: { summary: { category_id, category_name, year, spent,
  //   transaction_count, budget, remaining, pct_used }, period: {...},
  //   transactions: [...] }
  const { CategoryDetailData, categoryDetailLoading, categoryDetailFetching } =
    useExpenseCategoryDetail(categoryId, {
      search: debouncedSearch,
      page,
      limit: PAGE_SIZE,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    });

  const raw = CategoryDetailData?.data;
  const summary = raw?.results?.summary;
  const { items, total, pages } = unwrapPaginated(raw);

  const categoryName = summary?.category_name || "Loading...";

  // `summary.budget` is a full object when a budget exists — { id, year,
  // total_budget_amount, duration_months, monthly_allocated_amount } —
  // confirmed live. Everything the "Edit budget" flow needs comes straight
  // from it; no need to cross-reference the separate /budgets/ list.
  const budgetObj = summary?.budget;
  const hasBudget = Boolean(budgetObj);

  const spent = summary?.spent ?? 0;
  const transactionCount = summary?.transaction_count ?? total;
  const budgetAmount = budgetObj?.total_budget_amount ?? 0;
  const durationMonths = budgetObj?.duration_months ?? 0;
  const monthlyBudget =
    budgetObj?.monthly_allocated_amount ??
    (hasBudget && durationMonths > 0 ? budgetAmount / durationMonths : 0);
  const remaining =
    summary?.remaining ?? (hasBudget ? budgetAmount - spent : 0);
  const spentPct = Math.round(
    summary?.pct_used ??
      (hasBudget && budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0),
  );
  const progressTone =
    spentPct >= 100
      ? "bg-error-1"
      : spentPct >= 80
        ? "bg-warning-1"
        : "bg-primary-green-300";

  const existingBudget = budgetObj
    ? {
        id: budgetObj.id,
        year: budgetObj.year,
        total_budget_amount: budgetObj.total_budget_amount,
        duration_months: budgetObj.duration_months,
      }
    : undefined;

  const filtersActive = !!search || !!dateRange?.from;

  const resetFilters = () => {
    setSearch("");
    setDateRange(undefined);
    setPage(1);
  };

  return (
    <div className="w-full h-full flex flex-col gap-5 pb-12">
      {/* Header — back + title + actions */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center min-w-0 gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 mr-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl ml-3 sm:text-2xl font-extrabold text-grey-1 truncate min-w-0">
            {categoryName}
          </h1>
        </div>

        <Button
          onClick={() => setOpenBudgetEdit(true)}
          className="w-full sm:w-auto"
        >
          <PiggyBank className="w-4 h-4 mr-1.5" />
          {hasBudget ? "Edit budget" : "Set budget"}
        </Button>
      </header>

      {/* Budget summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categoryDetailLoading ? (
          <StatCardSkeletonRow count={4} gridClassName="contents" />
        ) : (
          <>
            <StatTile
              label="Budget"
              value={hasBudget ? formatToNaira(budgetAmount) : "—"}
              icon={<PiggyBank className="w-[15px] h-[15px]" />}
              tone="info"
              subtitle={
                hasBudget ? `${durationMonths}-month plan` : "No budget set"
              }
            />
            <StatTile
              label="Spent"
              value={formatToNaira(spent)}
              icon={<TrendingDown className="w-[15px] h-[15px]" />}
              tone="error"
              subtitle={`${transactionCount} ${transactionCount === 1 ? "transaction" : "transactions"}`}
            />
            <StatTile
              label="Remaining"
              value={hasBudget ? formatToNaira(remaining) : "—"}
              icon={<Wallet className="w-[15px] h-[15px]" />}
              tone={hasBudget && remaining < 0 ? "error" : "success"}
            />
            <StatTile
              label="Monthly Target"
              value={
                hasBudget && monthlyBudget ? formatToNaira(monthlyBudget) : "—"
              }
              icon={<TrendingUp className="w-[15px] h-[15px]" />}
              tone="neutral"
              subtitle={
                hasBudget ? "Auto-calculated" : "Set a budget to derive this"
              }
            />
          </>
        )}
      </section>

      {/* Progress strip */}
      {!categoryDetailLoading && hasBudget && (
        <section className="rounded-xl border border-grey-5 bg-white p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-bold text-grey-1">Budget used</p>
              <p className="text-[11px] text-grey-3 mt-0.5 flex items-center gap-1.5">
                <CalendarRange className="w-3 h-3" />
                {formatToNaira(spent)} of {formatToNaira(budgetAmount)} over{" "}
                {durationMonths} months
              </p>
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                spentPct >= 100
                  ? "text-error-1"
                  : spentPct >= 80
                    ? "text-warning-1"
                    : "text-primary-green-100",
              )}
            >
              {spentPct >= 100 ? "Over budget" : `${spentPct}%`}
            </span>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-grey-6 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", progressTone)}
              style={{ width: `${Math.min(100, spentPct)}%` }}
            />
          </div>
          {spentPct >= 100 && (
            <p className="text-[11px] text-error-1 mt-2">
              Budget exhausted — {formatToNaira(Math.abs(remaining))} over.
              Consider raising the cap.
            </p>
          )}
        </section>
      )}

      {/* Transactions card */}
      <section className="rounded-xl border border-grey-5 bg-white overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-grey-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div>
              <h3 className="text-sm font-bold text-grey-1">Transactions</h3>
              <p className="text-[11px] text-grey-3 mt-0.5">
                Every {categoryName.toLowerCase()} expense across the period
                below.
              </p>
            </div>
            <span className="text-[11px] text-grey-3">
              {total} {total === 1 ? "result" : "results"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <div className="w-full md:w-72 md:shrink-0">
              <SearchInput
                placeholder="Search expense name..."
                value={search}
                onValueChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
              />
            </div>
            <div className="md:w-[220px]">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(r) => {
                  setDateRange(r);
                  setPage(1);
                }}
                className="w-full"
              />
            </div>
          </div>

          {filtersActive && (
            <div className="mt-3 flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs font-bold text-grey-2 hover:bg-secondary-6"
              >
                <FilterX className="w-3 h-3 mr-1" />
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {categoryDetailLoading ? (
          <TableSkeleton
            rows={5}
            columns={[
              { flex: true },
              { width: "w-24", hiddenOnMobile: true },
              { width: "w-20", hiddenOnMobile: true },
              { width: "w-16", alignRight: true },
            ]}
          />
        ) : (
          <>
            <div
              className={cn(
                "hidden md:block overflow-x-auto",
                categoryDetailFetching && "opacity-50",
              )}
            >
              <table className="w-full">
                <thead className="bg-grey-6 border-b border-grey-5">
                  <tr className="text-left">
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Expense
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Date
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Added By
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t: any) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTxn(t)}
                      className="border-b border-grey-5 hover:bg-secondary-6/40 cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-grey-1">
                          {t.name || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-grey-2 whitespace-nowrap">
                        {t.date ? moment(t.date).format("MMM D, YYYY") : "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-grey-2">
                        {getRefLabel(t.added_by)}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-grey-1 text-right whitespace-nowrap">
                        {formatToNaira(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul
              className={cn(
                "md:hidden divide-y divide-grey-5",
                categoryDetailFetching && "opacity-50",
              )}
            >
              {items.map((t: any) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedTxn(t)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-secondary-6/40 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-grey-1 truncate block">
                        {t.name || "—"}
                      </span>
                      <p className="text-[11px] text-grey-3 mt-0.5">
                        {t.date ? moment(t.date).format("MMM D, YYYY") : "—"} ·{" "}
                        {getRefLabel(t.added_by)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-grey-1">
                        {formatToNaira(t.amount)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-grey-4 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>

            {items.length === 0 && (
              <div className="py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-grey-6 mx-auto flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-grey-4" />
                </div>
                <p className="text-sm font-bold text-grey-1">
                  No expenses found
                </p>
                <p className="text-xs text-grey-3 mt-1">
                  {filtersActive
                    ? "Try widening the date range or clearing the filters."
                    : `No ${categoryName.toLowerCase()} expenses recorded yet.`}
                </p>
              </div>
            )}

            {items.length > 0 && (
              <div className="px-3 py-2 border-t border-grey-5">
                <CustomPagination
                  currentPage={page}
                  totalPages={pages}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Modals */}
      <SetCategoryBudgetModal
        isOpen={openBudgetEdit}
        onClose={() => setOpenBudgetEdit(false)}
        categoryId={categoryId}
        categoryName={categoryName}
        existingBudget={existingBudget}
      />
      <TransactionDetailsModal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
      />
    </div>
  );
};

// ─── building blocks ────────────────────────────────────────────────────────
// Matches the flat tinted-card pattern used for overview KPIs across the app
// (see CustomExpenseCard in Expenses.tsx / CustomSalesCard in Sales.tsx) —
// icon+label row, big value below, no gradients or off-palette colors.

const STAT_TONE_STYLES: Record<string, { bg: string; iconColor: string }> = {
  info: { bg: "bg-info-2", iconColor: "text-info-1" },
  error: { bg: "bg-error-2", iconColor: "text-error-1" },
  success: { bg: "bg-success-2", iconColor: "text-success-1" },
  neutral: { bg: "bg-secondary-6", iconColor: "text-primary-green-300" },
};

const StatTile = ({
  label,
  value,
  icon,
  tone,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "info" | "error" | "success" | "neutral";
  subtitle?: string;
}) => {
  const style = STAT_TONE_STYLES[tone];
  return (
    <div className={cn("rounded-2xl p-3 sm:p-4", style.bg)}>
      <div className="flex items-center gap-2">
        <span className={style.iconColor}>{icon}</span>
        <p className={cn("text-xs font-bold", style.iconColor)}>{label}</p>
      </div>
      <p className="text-lg sm:text-xl font-extrabold text-grey-1 mt-2 truncate">
        {value}
      </p>
      {subtitle && (
        <p className="text-[11px] text-grey-3 mt-0.5 truncate">{subtitle}</p>
      )}
    </div>
  );
};

export default CategoryDetail;
