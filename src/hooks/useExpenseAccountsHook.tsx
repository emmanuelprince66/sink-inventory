"use client";

import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import {
  CreateBudgetPayload,
  useCreateBudgetMutation,
} from "@/api/expenses/create-budget";
import { useDeleteBudgetMutation } from "@/api/expenses/delete-budget";
import {
  EditBudgetPayload,
  useEditBudgetMutation,
} from "@/api/expenses/edit-budget";
import { useFetchBudgetsQuery } from "@/api/expenses/fetch-budgets";
import { useFetchExpenseCategoryByIdQuery } from "@/api/expenses/fetch-expense-category-by-id";
import { useFetchExpensesQuery } from "@/api/expenses/fetch-expenses";
import { useFetchRecentActivityQuery } from "@/api/expenses/fetch-recent-activity";
import { useFetchSpendByUserQuery } from "@/api/expenses/fetch-spend-by-user";
import { useFetchTransactionsQuery } from "@/api/expenses/fetch-transactions";
import {
  getRefId,
  getRefLabel,
  unwrapPaginated,
} from "@/app/(dashboard)/expenses/expense-accounts/expense-ui-meta";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

/** List of staff who can be filtered by in the "user" dropdowns. */
export const useExpenseUserOptions = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { data, isLoading } = useFetchAttendants(business_id, {
    enabled: !!business_id,
  });
  return { users: data?.data ?? [], usersLoading: isLoading };
};

/**
 * List of categories for filter/picker dropdowns — derived from the
 * confirmed-working /expenses/business/{id}/ endpoint rather than the
 * dedicated /categories/ list endpoint, which returns nothing usable
 * (confirmed live: a business with real categorised expenses gets back an
 * empty list from /categories/). Every expense item already carries its
 * category as {id, name}, so this is the same proven derivation used for
 * the category grid, just exposed as a shared hook so every dropdown
 * across the module (Transactions filter, Budgets category picker) uses
 * one real source instead of each guessing at the broken endpoint.
 */
export const useExpenseCategoryOptions = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { data, isLoading } = useFetchExpensesQuery({
    params: { id: business_id as string, limit: 200 },
    enabled: !!business_id,
  });
  const categoryOptions = useMemo(() => {
    const items = unwrapPaginated<any>(data?.data).items;
    const map = new Map<string, { id: string; name: string }>();
    for (const item of items) {
      const id = getRefId(item.category) || getRefLabel(item.category);
      if (!map.has(id)) {
        map.set(id, { id, name: getRefLabel(item.category, "Uncategorised") });
      }
    }
    return Array.from(map.values());
  }, [data]);

  return { categoryOptions, categoryOptionsLoading: isLoading };
};

/** Powers the "Expense Accounts" tab dashboard: recent activity, spend by user, budgets. */
export const useExpenseDashboardData = (dateFilters?: {
  start_date?: string;
  end_date?: string;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  // /recent-activity/ has no date-range params (search/page/limit only) —
  // "recent" is always relative to now, not the page's date filter.
  const { data: RecentActivityData, isLoading: recentActivityLoading } =
    useFetchRecentActivityQuery({
      params: { id: business_id as string, limit: 6 },
      enabled: !!business_id,
    });

  const { data: SpendByUserData, isLoading: spendByUserLoading } =
    useFetchSpendByUserQuery({
      params: {
        id: business_id as string,
        limit: 8,
        start_date: dateFilters?.start_date,
        end_date: dateFilters?.end_date,
      },
      enabled: !!business_id,
    });

  const { data: BudgetsData, isLoading: budgetsLoading } =
    useFetchBudgetsQuery({
      params: { id: business_id as string, limit: 50 },
      enabled: !!business_id,
    });

  return {
    business_id,
    RecentActivityData,
    recentActivityLoading,
    SpendByUserData,
    spendByUserLoading,
    BudgetsData,
    budgetsLoading,
  };
};

export type TransactionFilters = {
  search?: string;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  user?: string;
  category?: string;
  status?: string;
};

/** Powers the "Transactions" tab table — real server pagination + filters. */
export const useExpenseTransactionsTable = (filters: TransactionFilters) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data, isLoading, isFetching } = useFetchTransactionsQuery({
    params: { id: business_id as string, ...filters },
    enabled: !!business_id,
  });

  return { business_id, TransactionsData: data, transactionsLoading: isLoading, transactionsFetching: isFetching };
};

/** Powers the category detail page — one call returns both the summary card and the scoped table. */
export const useExpenseCategoryDetail = (
  categoryId: string,
  filters: TransactionFilters,
) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data, isLoading, isFetching, refetch } =
    useFetchExpenseCategoryByIdQuery({
      params: {
        id: business_id as string,
        categoryId,
        ...filters,
      },
      enabled: !!business_id && !!categoryId,
    });

  return {
    business_id,
    CategoryDetailData: data,
    categoryDetailLoading: isLoading,
    categoryDetailFetching: isFetching,
    refetchCategoryDetail: refetch,
  };
};

/** Create / edit / delete budget mutations, shared by the Set Budget modal. */
export const useExpenseBudgetActions = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();

  const invalidateBudgetData = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey.expenses.getBudgets] });
    queryClient.invalidateQueries({
      queryKey: [queryKey.expenses.getExpenseCategoryById],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKey.expenses.getExpenseCategories],
    });
  };

  const { mutate: createBudget, isPending: createBudgetLoading } =
    useCreateBudgetMutation({
      businessId: business_id as string,
      onSuccess: invalidateBudgetData,
    });

  const { mutate: editBudget, isPending: editBudgetLoading } =
    useEditBudgetMutation({
      businessId: business_id as string,
      onSuccess: invalidateBudgetData,
    });

  const { mutate: deleteBudget, isPending: deleteBudgetLoading } =
    useDeleteBudgetMutation({
      businessId: business_id as string,
      onSuccess: invalidateBudgetData,
    });

  const submitBudget = (
    payload: CreateBudgetPayload,
    existingBudgetId?: string,
    onDone?: () => void,
  ) => {
    if (existingBudgetId) {
      editBudget(
        { budgetId: existingBudgetId, payload: payload as EditBudgetPayload },
        { onSuccess: onDone },
      );
    } else {
      createBudget(payload, { onSuccess: onDone });
    }
  };

  return {
    submitBudget,
    createBudgetLoading,
    editBudgetLoading,
    deleteBudget,
    deleteBudgetLoading,
  };
};
