import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export type FetchTransactionsParams = {
  id: string;
  search?: string;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  user?: string;
  category?: string;
  status?: string;
};

export const fetchTransactions = async ({
  id,
  ...query
}: FetchTransactionsParams) => {
  const url = new URL(`/api/expenses/${id}/transactions`, window.location.origin);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error fetching transactions");
  }

  return response.json();
};

type QueryFnType = typeof fetchTransactions;

type UseFetchTransactionsOptions = QueryConfigType<QueryFnType> & {
  params: FetchTransactionsParams;
};

export const useFetchTransactionsQuery = ({
  params,
  ...config
}: UseFetchTransactionsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.expenses.getTransactions, params],
    queryFn: () => fetchTransactions(params),
    ...config,
  });
};
