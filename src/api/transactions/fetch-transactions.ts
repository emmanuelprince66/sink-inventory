import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchTransactionsProps = {
  id: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  type: string;
};

export const FetchTransaction = async ({
  id,
  search = "",
  start_date = "",
  end_date = "",
  page = 1,
  type = "",
  limit = 30,
}: fetchTransactionsProps) => {
  const url = new URL(`/api/transactions`, window.location.origin);

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (type) params.append("type", type);
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching  expenses data"
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof FetchTransaction;

type useFetchTransactionHistoryOptions = QueryConfigType<QueryFnType> & {
  params: fetchTransactionsProps;
};

export const useFetchTransactionQuery = ({
  params,
  ...config
}: useFetchTransactionHistoryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.transactions.getAllTransactions,
      params.id,
      params.search,
      params.start_date,
      params.type,
      params.end_date,
      params.limit,
      params.page,
    ],
    queryFn: () => FetchTransaction(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
