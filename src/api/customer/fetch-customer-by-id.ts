import { queryKey } from "@/constants/query-key";
import {
  QueryConfigType,
  useQuery,
  ExtractFnReturnType,
} from "@/lib/react-query";

export const fetchCustomerById = async (id: string) => {
  console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/customers/${id}/customer-by-id`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof fetchCustomerById;

type options = QueryConfigType<QueryFnType>;

export const useFetchCustomerById = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.customers.getCustomerById, id],
    queryFn: () => fetchCustomerById(id),
    ...config,
  });
};
