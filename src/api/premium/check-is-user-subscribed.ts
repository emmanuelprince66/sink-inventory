//OPTIMIZED
import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export async function CheckIsUserSubscribed() {
  const response = await fetch("/api/premium/check", { method: "GET" });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to fetch  subscription status"
    );
  }
  const data = await response.json();
  return data;
}

type QueryFnType = typeof CheckIsUserSubscribed;
type options = QueryConfigType<QueryFnType>;

export const useCheckIsUserSubscribedQuery = (config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.premium.checkIsUserSubscribed],
    queryFn: CheckIsUserSubscribed,
    ...config,
  });
};
