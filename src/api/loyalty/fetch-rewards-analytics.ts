import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyRewardsAnalytics } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchRewardsAnalyticsParams = {
  id: string;

};

export const fetchRewardsAnalytics = async ({ id }: FetchRewardsAnalyticsParams) => {
  const url = new URL(
    `/api/loyalty/${id}/rewards-analytics`,
    window.location.origin
  );

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching loyalty rewards analytics"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<LoyaltyRewardsAnalytics>>;
};

type QueryFnType = typeof fetchRewardsAnalytics;

type UseFetchRewardsAnalytics = QueryConfigType<QueryFnType> & {
  params: FetchRewardsAnalyticsParams;
};

export const useFetchRewardsAnalyticsQuery = ({
  params,
  ...config
}: UseFetchRewardsAnalytics) => {
  const { mutate: logout } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if (error.status === 401) {
        logout();
      }
      if ([404, 401].includes(error.status)) return failureCount < 2;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.loyalty.getRewardsAnalytics,
      params.id,
    ],
    queryFn: () => fetchRewardsAnalytics(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
