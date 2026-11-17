//OPTIMIZED
import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

/**
 * GET user/active_plan/. `businessId` is passed only for a branch that isn't
 * the founding one — those are billed on their own, and the backend returns
 * the founding branch's plan when it's left out.
 */
export async function GetAllSubscriptions(businessId?: string | null) {
  const url = businessId
    ? `/api/premium?business_id=${encodeURIComponent(businessId)}`
    : "/api/premium";
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch  subscriptions");
  }
  const data = await response.json();
  return data;
}

type QueryFnType = typeof GetAllSubscriptions;
type options = QueryConfigType<QueryFnType>;

export const useGetAllSubscriptionsQuery = (
  config?: options & { businessId?: string | null },
) => {
  const { businessId, ...rest } = config ?? {};
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.premium.getAllSubscriptions, businessId ?? "founding"],
    queryFn: () => GetAllSubscriptions(businessId),
    ...rest,
  });
};
