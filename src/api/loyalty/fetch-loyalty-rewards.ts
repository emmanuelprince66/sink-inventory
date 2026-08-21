import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyReward } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchLoyaltyRewardsParams = {
  id: string;
  status?: string;
};

export const fetchLoyaltyRewards = async ({
  id,
  status,
}: FetchLoyaltyRewardsParams) => {
  const url = new URL(
    `/api/loyalty/${id}/rewards`,
    window.location.origin
  );

  const params = new URLSearchParams();
  if (status) params.append("status", status);
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
      errorData.message || "Error fetching loyalty rewards"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<LoyaltyReward>>;
};

type QueryFnType = typeof fetchLoyaltyRewards;

type UseFetchLoyaltyRewards = QueryConfigType<QueryFnType> & {
  params: FetchLoyaltyRewardsParams;
};

export const useFetchLoyaltyRewardsQuery = ({
  params,
  ...config
}: UseFetchLoyaltyRewards) => {
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
      queryKey.loyalty.getLoyaltyRewards,
      params.id,
      params.status,
    ],
    queryFn: () => fetchLoyaltyRewards(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
