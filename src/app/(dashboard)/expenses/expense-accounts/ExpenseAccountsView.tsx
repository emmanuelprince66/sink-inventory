"use client";

import { useFetchExpensesQuery } from "@/api/expenses/fetch-expenses";
import { CardGridSkeleton } from "@/components/app/CardGridSkeleton";
import { SearchInput } from "@/components/app/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useExpenseCategoryOptions,
  useExpenseDashboardData,
} from "@/hooks/useExpenseAccountsHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Activity,
  ChevronRight,
  Inbox,
  LayoutGrid,
  PiggyBank,
  Receipt,
  Users,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  getCategoryMeta,
  getRefId,
  getRefLabel,
  getStatusMeta,
  unwrapPaginated,
} from "./expense-ui-meta";

interface ExpenseAccountsViewProps {
  /** Same range as the page-level date picker — the grid/activity/spend
   * widgets stay consistent with the "Total Expenses" overview card instead
   * of each silently falling back to whatever the backend defaults to when
   * no dates are passed. */
  dateRange?: DateRange;
  onViewTransaction: (txn: any) => void;
  /** Switch the parent page to its Transactions tab. */
  onViewAllTransactions: () => void;
}

interface ExpenseCategory {
  id: string;
  name: string;
  [key: string]: any;
}

interface Budget {
  id: string;
  category_name: string;
  total_budget_amount?: number;
  monthly_allocated_amount?: number;
  duration_months?: number;
  [key: string]: any;
}

const ALL_CATEGORIES = "__all__";

const ExpenseAccountsView = ({
  dateRange,
  onViewTransaction,
  onViewAllTransactions,
}: ExpenseAccountsViewProps) => {
  const router = useRouter();
  const goToCategory = (categoryId: string) =>
    router.push(`/expenses/categories/${encodeURIComponent(categoryId)}`);

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);
  const debouncedCategorySearch = useDebounce(categorySearch, 500);

  // Dropdown options come from the full, unfiltered category list (same
  // hook used by the Transactions tab / Budgets) so picking a category
  // doesn't shrink its own option list once a filter is applied.
  const { categoryOptions } = useExpenseCategoryOptions();

  console.log("categoryOptions", categoryOptions);

  const start_date = dateRange?.from
    ? moment(dateRange.from).format("YYYY-MM-DD")
    : undefined;
  const end_date = dateRange?.to
    ? moment(dateRange.to).format("YYYY-MM-DD")
    : undefined;

  const {
    business_id,
    RecentActivityData,
    recentActivityLoading,
    SpendByUserData,
    spendByUserLoading,
    BudgetsData,
    budgetsLoading,
  } = useExpenseDashboardData({ start_date, end_date });

  const budgets: Budget[] = BudgetsData?.data?.data ?? [];
  const budgetByCategoryName = new Map(
    budgets.map((b) => [b.category_name, b]),
  );

  // The cards on this grid are built straight from
  // /expenses/business/{id}/ — the proven, confirmed-working endpoint —
  // rather than the separate /categories/ list. Every expense item already
  // carries its category as {id, name}, so grouping by that gives us the
  // per-category spend/count/id we need for the card (and its "Set budget"
  // button) without depending on an unconfirmed endpoint. Scoped to the same
  // date range as the page's "Total Expenses" card — omitting start/end
  // entirely made the backend apply its own (much narrower) default window,
  // silently hiding real data. A category with zero logged expenses in this
  // window won't show up here — it can still get a budget set up front via
  // the standalone Budgets screen.
  // `search`/`category` are sent straight to the endpoint (it natively
  // supports both query params) rather than filtered client-side after the
  // fact, so the grid reflects exactly what the backend matched.
  const {
    data: AllExpensesData,
    isLoading: allExpensesLoading,
    isFetching: allExpensesFetching,
  } = useFetchExpensesQuery({
    params: {
      id: business_id as string,
      limit: 200,
      start_date,
      end_date,
      search: debouncedCategorySearch || undefined,
      category: categoryFilter !== ALL_CATEGORIES ? categoryFilter : undefined,
    },
    enabled: !!business_id,
  });
  const expenseCategories: ExpenseCategory[] = useMemo(() => {
    const items = unwrapPaginated<any>(AllExpensesData?.data).items;
    const map = new Map<
      string,
      ExpenseCategory & {
        total: number;
        count: number;
        latestExpenseName?: string;
        latestDate?: string;
      }
    >();
    for (const item of items) {
      const id = getRefId(item.category) || getRefLabel(item.category);
      const name = getRefLabel(item.category, "Uncategorised");
      const prev = map.get(id) || {
        id,
        name,
        total: 0,
        count: 0,
        latestExpenseName: undefined,
        latestDate: undefined,
      };
      // Track the most recently dated expense in this category so the card
      // can show what it was actually for, not just a bare count.
      const isNewer = !prev.latestDate || (item.date && item.date >= prev.latestDate);
      map.set(id, {
        ...prev,
        total: prev.total + (item.amount || 0),
        count: prev.count + 1,
        latestExpenseName: isNewer ? item.name || prev.latestExpenseName : prev.latestExpenseName,
        latestDate: isNewer ? item.date || prev.latestDate : prev.latestDate,
      });
    }
    return Array.from(map.values());
  }, [AllExpensesData]);

  const categoryFiltersActive =
    !!categorySearch || categoryFilter !== ALL_CATEGORIES;

  const recentActivity = unwrapPaginated(RecentActivityData?.data).items;
  const spendByUser = unwrapPaginated(SpendByUserData?.data).items;

  return (
    <div className="w-full space-y-5">
      {/* Account Balance + Spent This Month now live on the main Expenses
          overview row (see Expenses.tsx) — not repeated here. */}

      {/* Categories */}
      <section>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-grey-1 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary-green-300" />
              Categories & Budgets
            </h3>
            <p className="text-xs text-grey-3 mt-0.5">
              Tap a category to view its transactions and set or edit its
              budget.
            </p>
          </div>
          <Link
            href="/expenses/budgets"
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-primary-green-300 hover:text-primary-green-100 cursor-pointer"
          >
            <PiggyBank className="w-3.5 h-3.5" />
            Manage budgets
          </Link>
        </div>

        {/* Search + category filter — same SearchInput + Select pattern as the
            Transactions tab, sent straight to /expenses/business/{id}/'s
            own `search` and `category` query params. Dropdown lists every
            category on the account, not just the ones in the current
            filtered result, so it never shrinks its own option list. */}
        {categoryOptions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <div className="w-full sm:w-72">
              <SearchInput
                placeholder="Search expenses..."
                value={categorySearch}
                onValueChange={setCategorySearch}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 min-h-0 font-bold text-grey-2 w-full sm:w-[190px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="min-w-[220px]">
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {categoryOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {budgetsLoading || allExpensesLoading ? (
          <CardGridSkeleton
            count={8}
            cardHeight="h-[190px]"
            gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          />
        ) : expenseCategories.length === 0 ? (
          categoryFiltersActive ? (
            <div className="text-center py-14">
              <div className="w-10 h-10 rounded-full bg-grey-6 mx-auto flex items-center justify-center mb-2.5">
                <Inbox className="w-4 h-4 text-grey-4" />
              </div>
              <p className="text-xs text-grey-3">
                No expenses match your search or filter.
              </p>
              <button
                onClick={() => {
                  setCategorySearch("");
                  setCategoryFilter(ALL_CATEGORIES);
                }}
                className="mt-2 text-xs font-bold text-primary-green-300 hover:text-primary-green-100 cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <EmptyState label="No expenses logged yet." />
          )
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3",
              allExpensesFetching && "opacity-50 transition-opacity",
            )}
          >
            {expenseCategories.map((c) => (
              <ExpenseCard
                key={c.id}
                category={c}
                budget={budgetByCategoryName.get(c.name)}
                stats={{
                  total: c.total,
                  count: c.count,
                  latestExpenseName: c.latestExpenseName,
                }}
                onViewMore={() => goToCategory(c.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent activity + spend by user */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RecentActivity
          items={recentActivity}
          loading={recentActivityLoading}
          onViewItem={onViewTransaction}
          onViewAll={onViewAllTransactions}
        />
        <SpendByUser items={spendByUser} loading={spendByUserLoading} />
      </div>
    </div>
  );
};

// ─── Expense card — one per category, derived from /expenses/business/{id}/ ──

const ExpenseCard = ({
  category,
  budget,
  stats,
  onViewMore,
}: {
  category: ExpenseCategory;
  budget?: Budget;
  stats?: { total: number; count: number; latestExpenseName?: string };
  onViewMore: () => void;
}) => {
  const meta = getCategoryMeta(category.name);
  const Icon = meta.icon;
  const hasBudget = Boolean(budget);
  const spent = stats?.total || 0;
  const count = stats?.count || 0;
  const latestExpenseName = stats?.latestExpenseName;
  // `total_budget_amount`/`monthly_allocated_amount` are the real Naira
  // values entered when the budget was set. Their "_formatted" siblings
  // from this endpoint come back scaled by /100 (confirmed live: a ₦200
  // budget reports total_budget_amount_formatted: 2) — don't use them.
  const budgetAmount = budget?.total_budget_amount || 0;
  const monthly =
    budget?.monthly_allocated_amount ??
    (hasBudget && budget!.duration_months
      ? Math.round(budgetAmount / budget!.duration_months)
      : 0);
  const pct =
    hasBudget && budgetAmount > 0
      ? Math.round((spent / budgetAmount) * 100)
      : 0;
  const progressTone =
    pct >= 100
      ? "bg-error-1"
      : pct >= 80
        ? "bg-warning-1"
        : "bg-primary-green-300";

  return (
    <button
      type="button"
      onClick={onViewMore}
      className="group flex flex-col h-full rounded-xl border border-grey-5 bg-white hover:border-primary-green-300/40 hover:shadow-md transition-all overflow-hidden text-left cursor-pointer"
    >
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center border shrink-0",
              meta.tone,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-grey-1 truncate">
              {category.name}
            </p>
            <p className="text-[11px] text-grey-3 mt-0.5 truncate">
              {hasBudget
                ? `${budget!.duration_months}-month budget · ~${formatToNaira(monthly)}/mo`
                : "No budget set"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <p className="text-xl font-extrabold text-grey-1">
            {formatToNaira(spent)}
          </p>
          {hasBudget && (
            <p className="text-xs text-grey-3">
              of {formatToNaira(budgetAmount)}
            </p>
          )}
        </div>
        <p className="text-[11px] text-grey-3 mt-0.5">
          {count} {count === 1 ? "transaction" : "transactions"}
        </p>
        {latestExpenseName && (
          <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-grey-6 px-2 py-1 text-[11px] font-semibold text-grey-2 truncate max-w-full w-fit">
            <Receipt className="w-3 h-3 text-grey-4 shrink-0" />
            <span className="truncate">{latestExpenseName}</span>
          </p>
        )}

        {/* Always rendered (even without a budget) so every card in the row
            ends up the same height — no ragged grid from optional content. */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-grey-3">Budget used</span>
            <span
              className={cn(
                "font-bold",
                !hasBudget
                  ? "text-grey-4"
                  : pct >= 100
                    ? "text-error-1"
                    : pct >= 80
                      ? "text-warning-1"
                      : "text-primary-green-100",
              )}
            >
              {hasBudget ? `${pct}%` : "—"}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-grey-6 overflow-hidden">
            {hasBudget && (
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  progressTone,
                )}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 shrink-0">
        <div
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-bold transition-colors",
            "bg-secondary-6 text-primary-green-300 group-hover:bg-primary-green-300 group-hover:text-white",
          )}
        >
          <PiggyBank className="w-3 h-3" />
          {hasBudget ? "View more" : "Set budget"}
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </button>
  );
};

// ─── Recent activity ────────────────────────────────────────────────────────

const RecentActivity = ({
  items,
  loading,
  onViewItem,
  onViewAll,
}: {
  items: any[];
  loading: boolean;
  onViewItem: (txn: any) => void;
  onViewAll: () => void;
}) => (
  <div className="rounded-xl border border-grey-5 bg-white">
    <div className="flex items-center justify-between p-4 border-b border-grey-5">
      <div>
        <h4 className="text-sm font-bold text-grey-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-green-300" />
          Recent Activity
        </h4>
        <p className="text-[11px] text-grey-3 mt-0.5">
          Latest logged expenses across every category.
        </p>
      </div>
      <button
        onClick={onViewAll}
        className="text-[11px] font-bold text-primary-green-300 hover:text-primary-green-100 cursor-pointer"
      >
        View all
      </button>
    </div>
    {loading ? (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg bg-grey-5" />
        ))}
      </div>
    ) : items.length === 0 ? (
      <EmptyState label="No transactions yet" compact />
    ) : (
      <ul className="divide-y divide-grey-5/60">
        {items.map((t) => {
          const statusMeta = getStatusMeta(t.status);
          const categoryLabel = getRefLabel(t.category, "Uncategorised");
          const meta = getCategoryMeta(categoryLabel);
          const Icon = meta.icon;
          return (
            <li key={t.id}>
              <button
                onClick={() => onViewItem(t)}
                className="w-full p-3 flex items-center gap-3 hover:bg-secondary-6/40 transition-colors text-left cursor-pointer"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-md flex items-center justify-center border shrink-0",
                    meta.tone,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-grey-1 truncate">
                      {t.name || categoryLabel}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        statusMeta.pill,
                      )}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-grey-3 truncate mt-0.5">
                    {categoryLabel} · {getRefLabel(t.initiated_by)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-grey-1">
                    {formatToNaira(t.amount)}
                  </p>
                  <p className="text-[10px] text-grey-3">
                    {moment(t.created_at || t.date).fromNow()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-grey-4 shrink-0" />
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

// ─── Spend by user ──────────────────────────────────────────────────────────

const SpendByUser = ({
  items,
  loading,
}: {
  items: any[];
  loading: boolean;
}) => {
  const max = Math.max(...items.map((d) => d.total_spent ?? 0), 1);
  return (
    <div className="rounded-xl border border-grey-5 bg-white">
      <div className="p-4 border-b border-grey-5">
        <h4 className="text-sm font-bold text-grey-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-green-300" />
          Spend by User
        </h4>
        <p className="text-[11px] text-grey-3 mt-0.5">
          Who's logged the most spend this period.
        </p>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-lg bg-grey-5" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState label="No data yet." compact />
        ) : (
          <ul className="space-y-3">
            {items.map((d, i) => {
              const amount = d.total_spent ?? 0;
              const name = d.user_name || "Unknown";
              const pct = Math.round((amount / max) * 100);
              return (
                <li key={d.user_id || i}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-grey-1 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-grey-1 truncate">
                          {name}
                        </p>
                        <p className="text-[10px] text-grey-3">
                          {d.transaction_count ?? 0}{" "}
                          {d.transaction_count === 1 ? "expense" : "expenses"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-grey-1 shrink-0">
                      {formatToNaira(amount)}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full bg-grey-6 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-green-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

// ─── Empty state ────────────────────────────────────────────────────────────

const EmptyState = ({
  label,
  compact,
}: {
  label: string;
  compact?: boolean;
}) => (
  <div className={cn("text-center", compact ? "py-10" : "py-14")}>
    <div className="w-10 h-10 rounded-full bg-grey-6 mx-auto flex items-center justify-center mb-2.5">
      <Inbox className="w-4 h-4 text-grey-4" />
    </div>
    <p className="text-xs text-grey-3">{label}</p>
  </div>
);

export default ExpenseAccountsView;
