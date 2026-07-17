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
import { useFetchExpenseCategoriesQuery } from "@/api/expenses/fetch-expense-categories";
import { useFetchExpenseCategoryByIdQuery } from "@/api/expenses/fetch-expense-category-by-id";
import { useFetchRecentActivityQuery } from "@/api/expenses/fetch-recent-activity";
import { useFetchSpendByUserQuery } from "@/api/expenses/fetch-spend-by-user";
import { useFetchTransactionsQuery } from "@/api/expenses/fetch-transactions";
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
 * List of categories for filter/picker dropdowns — powered by the dedicated
 * /expenses/business/{id}/categories/ endpoint (confirmed live: returns
 * `{success, data: {data: [{category_id, category_name, spent,
 * transaction_count, budget, ...}], year}, message}`, proxied through our
 * own route which wraps it again as `data.data`). This lists every category
 * configured on the account, not just ones with logged expenses, so a
 * brand-new category can get a budget set before its first expense.
 */
export const useExpenseCategoryOptions = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { data, isLoading } = useFetchExpenseCategoriesQuery({
    params: { id: business_id as string, limit: 200 },
    enabled: !!business_id,
  });
  const categoryOptions = useMemo(() => {
    const items: any[] = data?.data?.data ?? [];
    return items.map((c) => ({ id: c.category_id, name: c.category_name }));
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

  const { data: BudgetsData, isLoading: budgetsLoading } = useFetchBudgetsQuery(
    {
      params: { id: business_id as string, limit: 50 },
      enabled: !!business_id,
    },
  );

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

  return {
    business_id,
    TransactionsData: data,
    transactionsLoading: isLoading,
    transactionsFetching: isFetching,
  };
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
