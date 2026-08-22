import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import type {
  CustomerTransactionsResponse,
  FetchCustomerTransactionsParams,
} from "@/types/customerTransaction";

export const fetchCustomerTransactions = async ({
  id,
  ...params
}: FetchCustomerTransactionsParams) => {
  const url = new URL(
    `/api/customers/${id}/transactions`,
    window.location.origin,
  );
  for (const [key, value] of Object.entries(params)) {
    // "ALL" is the server default, so sending it only makes the cache key noisy.
    if (value !== undefined && value !== "" && value !== "ALL") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching customer transactions",
    );
    (error as any).status = response.status;
    throw error;
  }

  return response.json() as Promise<
    ApiResponse<CustomerTransactionsResponse>
  >;
};

type QueryFnType = typeof fetchCustomerTransactions;

export const useFetchCustomerTransactionsQuery = ({
  params,
  ...config
}: QueryConfigType<QueryFnType> & {
  params: FetchCustomerTransactionsParams;
}) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    // A customer with no history 404s on some deployments; retrying that only
    // delays the empty state.
    retry: (failureCount, error: any) =>
      [401, 404].includes(error?.status) ? false : failureCount < 1,
    queryKey: [
      queryKey.customers.getCustomerTransactions,
      params.id,
      params.page,
      params.type,
      params.flow,
      params.status,
      params.start_date,
      params.end_date,
    ],
    queryFn: () => fetchCustomerTransactions(params),
    enabled: Boolean(params.id),
    ...config,
  });
