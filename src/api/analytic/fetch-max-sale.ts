import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchMaxSaleAnalytic = {
  id: string;
  year?: string;
};

export const fetchMaxSalesAnalytics = async ({
  id,
  year = "",
}: fetchMaxSaleAnalytic) => {
  const url = new URL(`/api/analytics/${id}/max-sales`, window.location.origin);

  const params = new URLSearchParams();
  if (year) params.append("year", year);

  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || "Error fetching sales  data");
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchMaxSalesAnalytics;

type useFetchSalesAnalyticOptions = QueryConfigType<QueryFnType> & {
  params: fetchMaxSaleAnalytic;
};

export const useFetchMaxSalesAnalyticQuery = ({
  params,
  ...config
}: useFetchSalesAnalyticOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [queryKey.analytics.getMaxSalesAnalytics, params.id, params.year],
    queryFn: () => fetchMaxSalesAnalytics(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
