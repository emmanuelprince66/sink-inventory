import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { CustomerAnalyticsOverview } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchCustomerOverviewParams = {
  id: string;
  month?: string;
};

export const fetchCustomerOverview = async ({
  id,
  month,
}: FetchCustomerOverviewParams) => {
  const url = new URL(
    `/api/customer-analytics/${id}/overview`,
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
      errorData.message || "Error fetching customer analytics overview"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<CustomerAnalyticsOverview>>;
};

type QueryFnType = typeof fetchCustomerOverview;

type UseFetchCustomerOverview = QueryConfigType<QueryFnType> & {
  params: FetchCustomerOverviewParams;
};

export const useFetchCustomerOverviewQuery = ({
  params,
  ...config
}: UseFetchCustomerOverview) => {
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
      queryKey.customerAnalytics.getOverview,
      params.id,
      params.month,
    ],
    queryFn: () => fetchCustomerOverview(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
