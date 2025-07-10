import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type FetchCustomersProps = {
  id: string;
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
};

export const fetchCustomers = async ({
  id,
  search = "",
  status = "",
  start_date = "",
  end_date = "",
  page = 1,
  limit = 30,
}: FetchCustomersProps) => {
  // Safely construct URL with search params
  const url = new URL(`/api/customers/${id}`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  if (status) url.searchParams.append("status", status);
  if (start_date) url.searchParams.append("start_date", start_date);
  if (end_date) url.searchParams.append("end_date", end_date);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

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
      params.start_date,
      params.end_date,
      params.limit,
      params.page,
    ],
    queryFn: () => fetchCustomers(params),
    ...config,
  });
};
