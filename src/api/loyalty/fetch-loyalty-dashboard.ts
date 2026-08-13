import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyDashboard } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchLoyaltyDashboardParams = {
  id: string;

};

export const fetchLoyaltyDashboard = async ({ id }: FetchLoyaltyDashboardParams) => {
  const url = new URL(
    `/api/loyalty/${id}/dashboard`,
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
      errorData.message || "Error fetching loyalty dashboard"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<LoyaltyDashboard>>;
};

type QueryFnType = typeof fetchLoyaltyDashboard;

type UseFetchLoyaltyDashboard = QueryConfigType<QueryFnType> & {
  params: FetchLoyaltyDashboardParams;
};

export const useFetchLoyaltyDashboardQuery = ({
  params,
  ...config
}: UseFetchLoyaltyDashboard) => {
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
      queryKey.loyalty.getLoyaltyDashboard,
      params.id,
    ],
    queryFn: () => fetchLoyaltyDashboard(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
