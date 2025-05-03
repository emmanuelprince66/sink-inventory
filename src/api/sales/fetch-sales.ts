import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchSalesHistoryProps = {
  id: string;
  type?: string;
  search?: string;
  attendanceId?: string;
  start_date?: string;
  end_date?: string;
};

export const fetchSalesHistory = async ({
  id,
  search = "",
  type = "",
  start_date = "",
  end_date = "",
  attendanceId = "",
}: fetchSalesHistoryProps) => {
  const url = new URL(`/api/sales/${id}`, window.location.origin);

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (type) params.append("type", type);
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  if (attendanceId) params.append("attendanceId", attendanceId);

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

type QueryFnType = typeof fetchSalesHistory;

type useFectchSalesHistoryOptions = QueryConfigType<QueryFnType> & {
  params: fetchSalesHistoryProps;
};

export const useFetchSalesHistoryQuery = ({
  params,
  ...config
}: useFectchSalesHistoryOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.sales.getAllSalesHistory,
      params.id,
      params.search,
      params.type,
      params.start_date,
      params.end_date,
    ],
    queryFn: () => fetchSalesHistory(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
