import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { UnifiedCustomerDashboard } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchCustomerDashboardParams = {
  id: string;
  month?: string;
};

export const fetchCustomerDashboard = async ({
  id,
  month,
}: FetchCustomerDashboardParams) => {
  const url = new URL(
    `/api/customer-analytics/${id}/dashboard`,
    window.location.origin
  );

  const params = new URLSearchParams();
  if (month) params.append("month", month);
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
      errorData.message || "Error fetching customer analytics dashboard"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<UnifiedCustomerDashboard>>;
};

type QueryFnType = typeof fetchCustomerDashboard;

type UseFetchCustomerDashboard = QueryConfigType<QueryFnType> & {
  params: FetchCustomerDashboardParams;
};

export const useFetchCustomerDashboardQuery = ({
  params,
  ...config
}: UseFetchCustomerDashboard) => {
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
      queryKey.customerAnalytics.getDashboard,
      params.id,
      params.month,
    ],
    queryFn: () => fetchCustomerDashboard(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
