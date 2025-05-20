import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchProductAnalyticsProps = {
  id: string;
  start_date?: string;
  end_date?: string;
};

export const fetchProductAnalytics = async ({
  id,
  start_date = "",
  end_date = "",
}: fetchProductAnalyticsProps) => {
  const url = new URL(`/api/analytics/${id}/products`, window.location.origin);

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
      errorData.message || "Error fetching product history data"
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchProductAnalytics;

type useFetchProductAnalyticsProps = QueryConfigType<QueryFnType> & {
  params: fetchProductAnalyticsProps;
};

export const useFetchProductAnalyticQuery = ({
  params,
  ...config
}: useFetchProductAnalyticsProps) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.analytics.getProductAnalytics,
      params.id,
      params.start_date,
      params.end_date,
    ],
    queryFn: () => fetchProductAnalytics(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
