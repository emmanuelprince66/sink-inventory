import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { TopSpendingCustomer } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchTopSpendingParams = {
  id: string;
  limit?: number;
};

export const fetchTopSpending = async ({
  id,
  limit,
}: FetchTopSpendingParams) => {
  const url = new URL(
    `/api/customer-analytics/${id}/top-spending`,
    window.location.origin
  );

  const params = new URLSearchParams();
  if (limit !== undefined) params.append("limit", String(limit));
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
      errorData.message || "Error fetching top spending customers"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<TopSpendingCustomer[]>>;
};

type QueryFnType = typeof fetchTopSpending;

type UseFetchTopSpending = QueryConfigType<QueryFnType> & {
  params: FetchTopSpendingParams;
};

export const useFetchTopSpendingQuery = ({
  params,
  ...config
}: UseFetchTopSpending) => {
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
      queryKey.customerAnalytics.getTopSpending,
      params.id,
      params.limit,
    ],
    queryFn: () => fetchTopSpending(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
