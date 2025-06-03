//OPTIMIZED
import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export async function GetAllSubscriptions() {
  const response = await fetch("/api/premium", { method: "GET" });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch  subscriptions");
  }
  const data = await response.json();
  return data;
}

type QueryFnType = typeof GetAllSubscriptions;
type options = QueryConfigType<QueryFnType>;

export const useGetAllSubscriptionsQuery = (config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.premium.getAllSubscriptions],
    queryFn: GetAllSubscriptions,
    ...config,
  });
};
