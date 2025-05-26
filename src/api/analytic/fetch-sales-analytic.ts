import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchSalesAnalyticProps = {
  id: string;
  attendance_id?: string;
  start_date?: string;
  end_date?: string;
};

export const fetchSalesAnalytics = async ({
  id,
  start_date = "",
  end_date = "",
  attendance_id = "",
}: fetchSalesAnalyticProps) => {
  const url = new URL(`/api/analytics/${id}/sales`, window.location.origin);

  const params = new URLSearchParams();
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  if (attendance_id) params.append("attendance_id", attendance_id);

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
      errorData.message || "Error fetching sales history data"
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchSalesAnalytics;

type useFetchSalesAnalyticOptions = QueryConfigType<QueryFnType> & {
  params: fetchSalesAnalyticProps;
};

export const useFetchSalesAnalyticQuery = ({
  params,
  ...config
}: useFetchSalesAnalyticOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.analytics.getSalesAnalytics,
      params.id,
      params.start_date,
      params.end_date,
      params.attendance_id,
    ],
    queryFn: () => fetchSalesAnalytics(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
