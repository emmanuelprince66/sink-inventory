import { queryKey } from "@/constants/query-key";
import {
  QueryConfigType,
  useQuery,
  ExtractFnReturnType,
} from "@/lib/react-query";

export const fetchCustomerPurchaseHistory = async (id: string) => {
  const response = await fetch(`/api/customers/${id}/purchase-history`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof fetchCustomerPurchaseHistory;

type options = QueryConfigType<QueryFnType>;

export const useFetchCustomerPurchaseHistory = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.customers.customerPurchaseHistory, id],
    queryFn: () => fetchCustomerPurchaseHistory(id),
    ...config,
  });
};
