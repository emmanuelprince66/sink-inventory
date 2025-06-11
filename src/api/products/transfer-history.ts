import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const FetchTransferHistory = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/products/transfer-history/${id}`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof FetchTransferHistory;

type options = QueryConfigType<QueryFnType>;

export const useFetchTransferHistoryQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.products.transferHistory, id],
    queryFn: () => FetchTransferHistory(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
