import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export type FetchExpenseCategoriesParams = {
  id: string;
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchExpenseCategories = async ({
  id,
  ...query
}: FetchExpenseCategoriesParams) => {
  const url = new URL(
    `/api/expenses/${id}/categories`,
    window.location.origin,
  );
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error fetching expense categories");
  }

  return response.json();
};

type QueryFnType = typeof fetchExpenseCategories;

type UseFetchExpenseCategoriesOptions = QueryConfigType<QueryFnType> & {
  params: FetchExpenseCategoriesParams;
};

export const useFetchExpenseCategoriesQuery = ({
  params,
  ...config
}: UseFetchExpenseCategoriesOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.expenses.getExpenseCategories, params],
    queryFn: () => fetchExpenseCategories(params),
    ...config,
  });
};
