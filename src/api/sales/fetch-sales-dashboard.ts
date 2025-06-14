import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const fetchSalesDashboard = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/sales/${id}/sales-dashboard`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof fetchSalesDashboard;

type options = QueryConfigType<QueryFnType>;

export const useFetchSalesDashboardQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.sales.salesDashboard, id],
    queryFn: () => fetchSalesDashboard(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
