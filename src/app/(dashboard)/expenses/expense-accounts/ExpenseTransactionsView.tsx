"use client";

import { useFetchExpensesQuery } from "@/api/expenses/fetch-expenses";
import CustomPagination from "@/components/app/CustomPagination";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpenseCategoryOptions } from "@/hooks/useExpenseAccountsHook";
import { useDebounce } from "@/hooks/useDebounce";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ChevronRight, FilterX, Inbox } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { getCategoryMeta, getRefLabel, unwrapPaginated } from "./expense-ui-meta";

interface ExpenseTransactionsViewProps {
  onSelectTransaction: (txn: any) => void;
  /** Optional pre-applied category filter (e.g. from a category card link). */
  initialCategory?: string;
  /** Same range as the page-level date picker. Controlled from the parent —
   * this tab doesn't get its own independent date filter, it just follows
   * whatever's selected up top (same as the overview cards / category grid). */
  dateRange?: DateRange;
}

const PAGE_SIZE = 10;
const ALL = "__all__";

// Powered by /expenses/business/{id}/ — the confirmed, working expenses
// endpoint (same one behind the "Total Expenses" overview card). Each item
// already carries `category: {id, name}`, which is what drives the
// category grid + budget lookups elsewhere on this page.
const ExpenseTransactionsView = ({
  onSelectTransaction,
  initialCategory,
  dateRange,
}: ExpenseTransactionsViewProps) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(initialCategory || ALL);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      setPage(1);
    }
  }, [initialCategory]);

  const debouncedSearch = useDebounce(search, 500);

  const { categoryOptions: categories } = useExpenseCategoryOptions();

  const { data: ExpensesData, isLoading, isFetching } = useFetchExpensesQuery({
    params: {
      id: business_id as string,
      search: debouncedSearch,
      page,
      limit: PAGE_SIZE,
      category: category !== ALL ? category : undefined,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    },
    enabled: !!business_id,
  });

  const raw = ExpensesData?.data;
  const { items, total, pages } = unwrapPaginated(raw);

  const filtersActive = !!search || category !== ALL;

  const resetFilters = () => {
    setSearch("");
    setCategory(ALL);
    setPage(1);
  };

  return (
    <div className="w-full space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border border-grey-5 bg-white p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-full md:w-72 md:shrink-0">
            <SearchInput
              placeholder="Search by expense name..."
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 min-h-0 font-bold text-grey-2 md:w-[190px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="min-w-[220px]">
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-grey-3">
            {total} {total === 1 ? "result" : "results"}
          </span>
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs font-bold text-grey-2 hover:bg-secondary-6 hover:text-primary-green-300"
            >
              <FilterX className="w-3 h-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-grey-5 bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg bg-grey-5" />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-grey-6 border-b border-grey-5">
                  <tr className="text-left">
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Expense
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Category
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Added By
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Amount
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className={cn(isFetching && "opacity-50")}>
                  {items.map((t: any) => {
                    const categoryLabel = getRefLabel(
                      t.category,
                      "Uncategorised",
                    );
                    const catMeta = getCategoryMeta(categoryLabel);
                    const CatIcon = catMeta.icon;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => onSelectTransaction(t)}
                        className="border-b border-grey-5 hover:bg-secondary-6/40 cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-grey-1">
                            {t.name || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "w-6 h-6 rounded-md flex items-center justify-center border",
                                catMeta.tone,
                              )}
                            >
                              <CatIcon className="w-3 h-3" />
                            </span>
                            <span className="text-sm text-grey-2">
                              {categoryLabel}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-grey-2">
                          {getRefLabel(t.added_by)}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-grey-1 text-right whitespace-nowrap">
                          {formatToNaira(t.amount)}
                        </td>
                        <td className="py-3 px-4 text-xs text-grey-3 text-right whitespace-nowrap">
                          {t.date ? moment(t.date).format("MMM D, YYYY") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul
              className={cn(
                "md:hidden divide-y divide-grey-5",
                isFetching && "opacity-50",
              )}
            >
              {items.map((t: any) => {
                const categoryLabel = getRefLabel(t.category, "Uncategorised");
                const catMeta = getCategoryMeta(categoryLabel);
                const CatIcon = catMeta.icon;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => onSelectTransaction(t)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-secondary-6/40 transition-colors text-left cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                          catMeta.tone,
                        )}
                      >
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-grey-1 truncate block">
                          {t.name || "—"}
                        </span>
                        <p className="text-[11px] text-grey-3 truncate mt-0.5">
                          {categoryLabel} · {getRefLabel(t.added_by)}
                        </p>
                        <p className="text-[11px] text-grey-3 mt-0.5">
                          {t.date ? moment(t.date).format("MMM D, YYYY") : "—"}
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
                );
              })}
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
                    ? "Try clearing the filters above."
                    : "Expenses will show up here as your team logs them."}
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
      </div>
    </div>
  );
};

export default ExpenseTransactionsView;
