import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type fetchOrderHistoryProps = {
  id: string;
  status?: string;
  search?: string;
  attendanceId?: string;
  start_date?: string;
  end_date?: string;
};

export const fetchOrderHistory = async ({
  id,
  search = "",
  status = "",
  start_date = "",
  end_date = "",
}: fetchOrderHistoryProps) => {
  // Safely construct URL with search params
  const url = new URL(`/api/sales/${id}/order-history`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  if (status) url.searchParams.append("status", status);
  if (start_date) url.searchParams.append("start_date", start_date);
  if (end_date) url.searchParams.append("end_date", end_date);

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching sales history data");
    // Attach status code for retry logic
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchOrderHistory;

type useFetchOrderHistoryProps = QueryConfigType<QueryFnType> & {
  params: fetchOrderHistoryProps;
};

export const useFetchOrderHistoryQuery = ({
  params,
  ...config
}: useFetchOrderHistoryProps) => {
  console.log("params", params);

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      return failureCount < 2;
    },
    // Include all parameters in the query key

    queryKey: [
      queryKey.sales.getAllOrdersHistory,
      params.id,
      params.search,
      params.status,
      params.start_date,
      params.end_date,
    ],
    queryFn: () => fetchOrderHistory(params),
    ...config,
  });
};
