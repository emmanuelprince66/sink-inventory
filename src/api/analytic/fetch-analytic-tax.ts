import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchTaxAnalytic = {
  id: string;
  year?: string;
  start_date?: string;
  end_date?: string;
};

export const fetchSalesAnalytics = async ({
  id,
  start_date = "",
  end_date = "",
  year = "",
}: fetchTaxAnalytic) => {
  const url = new URL(`/api/analytics/${id}/tax`, window.location.origin);

  const params = new URLSearchParams();
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
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
    const error = new Error(
      errorData.message || "Error fetching tax analytic data",
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchSalesAnalytics;

type useFetchSalesAnalyticOptions = QueryConfigType<QueryFnType> & {
  params: fetchTaxAnalytic;
};

export const useFetchTaxAnalyticQuery = ({
  params,
  ...config
}: useFetchSalesAnalyticOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.analytics.getTaxAnalytics,
      params.id,
      params.start_date,
      params.end_date,
      params.year,
    ],
    queryFn: () => fetchSalesAnalytics(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
