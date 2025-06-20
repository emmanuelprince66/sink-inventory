import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const FetchProductTransactions = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/products/${id}/transactions`);
  if (!response.ok) throw new Error("Error fetching transaction data");
  return response.json();
};

type QueryFnType = typeof FetchProductTransactions;

type options = QueryConfigType<QueryFnType>;

export const useFetchProductTransactionsQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.products.transactionsHistory, id],
    queryFn: () => FetchProductTransactions(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
