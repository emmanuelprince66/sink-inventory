"use client";

import { useFetchBudgetsQuery } from "@/api/expenses/fetch-budgets";
import { SearchInput } from "@/components/app/SearchInput";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { useExpenseCategoryOptions } from "@/hooks/useExpenseAccountsHook";
import { useDebounce } from "@/hooks/useDebounce";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowLeft, Inbox, PencilLine, Plus } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import SetCategoryBudgetModal from "../expense-accounts/SetCategoryBudgetModal";
import { getCategoryMeta } from "../expense-accounts/expense-ui-meta";

interface Budget {
  id: string;
  category_name: string;
  year: number;
  total_budget_amount?: number;
  duration_months?: number;
  monthly_allocated_amount?: number;
  created_at?: string;
  [key: string]: any;
}

const Budgets = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const { data: BudgetsData, isLoading } = useFetchBudgetsQuery({
    params: { id: business_id as string, search: debouncedSearch, limit: 100 },
    enabled: !!business_id,
  });
  const budgets: Budget[] = BudgetsData?.data?.data ?? [];

  // Budget records only carry `category_name`, not `category_id` — resolve
  // it from the derived category list so editing can lock the category
  // picker the same way the category-detail page does.
  const { categoryOptions } = useExpenseCategoryOptions();
  const categoryIdByName = new Map(
    categoryOptions.map((c) => [c.name, c.id]),
  );

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center min-w-0">
          <Link
            href="/expenses"
            className="flex items-center gap-1.5 mr-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-xl ml-3 sm:text-2xl font-extrabold text-grey-1 truncate min-w-0">
            Budgets
          </h1>
        </div>

        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Budget
        </Button>
      </div>

      <div className="rounded-xl border border-grey-5 bg-white overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-grey-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="w-full sm:max-w-sm">
              <SearchInput
                placeholder="Search by category..."
                value={search}
                onValueChange={setSearch}
              />
            </div>
            {!isLoading && (
              <span className="text-xs font-bold text-grey-3 shrink-0">
                {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton
            rows={5}
            columns={[
              { flex: true, thumbnail: true },
              { width: "w-12", hiddenOnMobile: true },
              { width: "w-24", alignRight: true },
              { width: "w-20", hiddenOnMobile: true },
              { width: "w-20", alignRight: true, hiddenOnMobile: true },
            ]}
          />
        ) : budgets.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-grey-6 mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-grey-4" />
            </div>
            <p className="text-sm font-bold text-grey-1">No budgets yet</p>
            <p className="text-xs text-grey-3 mt-1">
              Create a budget for a category to start tracking spend against
              it.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-grey-6 border-b border-grey-5">
                  <tr className="text-left">
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Category
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Year
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Total Budget
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3">
                      Duration
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Monthly
                    </th>
                    <th className="py-2.5 px-4 text-xs font-bold text-grey-3 text-right">
                      Created
                    </th>
                    <th className="py-2.5 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => {
                    const meta = getCategoryMeta(b.category_name);
                    const Icon = meta.icon;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setEditingBudget(b)}
                        className="border-b border-grey-5 hover:bg-secondary-6/40 cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "w-7 h-7 rounded-md flex items-center justify-center border",
                                meta.tone,
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-sm font-bold text-grey-1">
                              {b.category_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-grey-2">
                          {b.year}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-grey-1 text-right whitespace-nowrap">
                          {formatToNaira(b.total_budget_amount || 0)}
                        </td>
                        <td className="py-3 px-4 text-sm text-grey-2">
                          {b.duration_months} months
                        </td>
                        <td className="py-3 px-4 text-sm text-grey-2 text-right whitespace-nowrap">
                          {formatToNaira(b.monthly_allocated_amount || 0)}
                        </td>
                        <td className="py-3 px-4 text-xs text-grey-3 text-right whitespace-nowrap">
                          {b.created_at
                            ? moment(b.created_at).format("MMM D, YYYY")
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <PencilLine className="w-4 h-4 text-grey-4 inline-block" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="md:hidden divide-y divide-grey-5">
              {budgets.map((b) => {
                const meta = getCategoryMeta(b.category_name);
                const Icon = meta.icon;
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => setEditingBudget(b)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-secondary-6/40 transition-colors text-left cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                          meta.tone,
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-grey-1 truncate block">
                          {b.category_name}
                        </span>
                        <p className="text-[11px] text-grey-3 mt-0.5">
                          {b.year} · {b.duration_months} months
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-grey-1">
                          {formatToNaira(b.total_budget_amount || 0)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <SetCategoryBudgetModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <SetCategoryBudgetModal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        categoryId={
          editingBudget ? categoryIdByName.get(editingBudget.category_name) : undefined
        }
        categoryName={editingBudget?.category_name}
        existingBudget={editingBudget || undefined}
      />
    </div>
  );
};

export default Budgets;
