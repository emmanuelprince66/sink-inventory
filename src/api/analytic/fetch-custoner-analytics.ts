import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchCustomerAnalyticProps = {
  id: string;
  start_date?: string;
  end_date?: string;
};

export const fetchCustomerAnalytic = async ({
  id,
  start_date = "",
  end_date = "",
}: fetchCustomerAnalyticProps) => {
  const url = new URL(`/api/analytics/${id}/customers`, window.location.origin);

  const params = new URLSearchParams();
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);

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
      errorData.message || "Error fetching customer data"
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchCustomerAnalytic;

type useFetchCustomerAnalyticProps = QueryConfigType<QueryFnType> & {
  params: fetchCustomerAnalyticProps;
};

export const useFetchCustomerAnalyticQuery = ({
  params,
  ...config
}: useFetchCustomerAnalyticProps) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.analytics.getCustomerAnalytics,
      params.id,
      params.start_date,
      params.end_date,
    ],
    queryFn: () => fetchCustomerAnalytic(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
