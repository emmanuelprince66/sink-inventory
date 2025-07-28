import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const fetchTrxBank = async (id: string) => {
  const response = await fetch(`/api/transactions/fetch-bank`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof fetchTrxBank;

type options = QueryConfigType<QueryFnType>;

export const useFetchTrxBank = (config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.transactions.fetchTrxBank],
    queryFn: fetchTrxBank,
    ...config,
  });
};
