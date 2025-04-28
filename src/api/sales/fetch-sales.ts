import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchSalesHistoryProps = {
  id: string;
  status?: string;
  search?: string;
  attendanceId?: string;
  start_date?: string;
  end_date?: string;
};

export const fetchSalesHistory = async ({
  id,
  search = "",
  status = "",
  start_date = "",
  end_date = "",
  attendanceId = "",
}: fetchSalesHistoryProps) => {
  // Safely construct URL with search params
  const url = new URL(`/api/sales/${id}`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  if (status) url.searchParams.append("status", status);
  if (start_date) url.searchParams.append("start_date", start_date);
  if (end_date) url.searchParams.append("end_date", end_date);
  if (attendanceId) url.searchParams.append("attendanceId", attendanceId);

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching sales history data");
    // Attach status code for retry logic
    (error as any).status = response.status;
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
  console.log("params", params);

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      return failureCount < 2;
    },
    // Include all parameters in the query key

    queryKey: [
      queryKey.sales.getAllSalesHistory,
      params.id,
      params.search,
      params.status,
      params.start_date,
      params.end_date,
      params.attendanceId,
    ],
    queryFn: () => fetchSalesHistory(params),
    ...config,
  });
};
