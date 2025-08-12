import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
type FetchProductTransactionsData = {
  id: string;
  page?: number;
  limit?: number;
};

export const FetchProductTransactions = async ({
  id,

  page = 1,
  limit = 30,
}: FetchProductTransactionsData) => {
  const url = new URL(
    `/api/products/${id}/transactions`,
    window.location.origin
  );

  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching answers data");
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof FetchProductTransactions;

type useGetProductTransactionProps = QueryConfigType<QueryFnType> & {
  params: FetchProductTransactionsData;
};

export const useFetchProductTransactionsQuery = ({
  params,
  ...config
}: useGetProductTransactionProps) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      return failureCount < 2;
    },
    // Include all parameters in the query key
    queryKey: [
      queryKey.products.transactionsHistory,
      params.id,
      params.page,
      params.limit,
    ],
    queryFn: () => FetchProductTransactions(params),
    ...config,
  });
};
