import { queryKey } from "@/constants/query-key";
import {
  QueryConfigType,
  useQuery,
  ExtractFnReturnType,
} from "@/lib/react-query";

type FetchCustomersProps = {
  id: string;
  status?: string;
  search?: string;
};

export const fetchCustomers = async ({
  id,
  search = "",
  status = "",
}: FetchCustomersProps) => {
  // Safely construct URL with search params
  const url = new URL(`/api/customers/${id}`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  if (status) url.searchParams.append("status", status);

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching answers data");
    // Attach status code for retry logic
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchCustomers;

type UseGetCustomerOptions = QueryConfigType<QueryFnType> & {
  params: FetchCustomersProps;
};

export const useGetCustomerQuery = ({
  params,
  ...config
}: UseGetCustomerOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      return failureCount < 2;
    },
    // Include all parameters in the query key
    queryKey: [
      queryKey.customers.getAllCustomers,
      params.id,
      params.search,
      params.status,
    ],
    queryFn: () => fetchCustomers(params),
    ...config,
  });
};
