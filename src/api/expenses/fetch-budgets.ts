import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export type FetchBudgetsParams = {
  id: string;
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchBudgets = async ({ id, ...query }: FetchBudgetsParams) => {
  const url = new URL(`/api/expenses/${id}/budgets`, window.location.origin);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error fetching budgets");
  }

  return response.json();
};

type QueryFnType = typeof fetchBudgets;

type UseFetchBudgetsOptions = QueryConfigType<QueryFnType> & {
  params: FetchBudgetsParams;
};

export const useFetchBudgetsQuery = ({
  params,
  ...config
}: UseFetchBudgetsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.expenses.getBudgets, params],
    queryFn: () => fetchBudgets(params),
    ...config,
  });
};
