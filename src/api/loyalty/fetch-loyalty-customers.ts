import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { BusinessCustomerLoyaltyOverview } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchLoyaltyCustomersParams = {
  id: string;
  search?: string;
  tier_id?: string;
};

export const fetchLoyaltyCustomers = async ({
  id,
  search,
  tier_id,
}: FetchLoyaltyCustomersParams) => {
  const url = new URL(
    `/api/loyalty/${id}/customers`,
    window.location.origin
  );

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (tier_id) params.append("tier_id", tier_id);
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
      errorData.message || "Error fetching loyalty customers"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<BusinessCustomerLoyaltyOverview>>;
};

type QueryFnType = typeof fetchLoyaltyCustomers;

type UseFetchLoyaltyCustomers = QueryConfigType<QueryFnType> & {
  params: FetchLoyaltyCustomersParams;
};

export const useFetchLoyaltyCustomersQuery = ({
  params,
  ...config
}: UseFetchLoyaltyCustomers) => {
  const { mutate: logout } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if (error.status === 401) {
        logout();
      }
      if ([404, 401].includes(error.status)) return failureCount < 2;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.loyalty.getLoyaltyCustomers,
      params.id,
      params.search,
      params.tier_id,
    ],
    queryFn: () => fetchLoyaltyCustomers(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
