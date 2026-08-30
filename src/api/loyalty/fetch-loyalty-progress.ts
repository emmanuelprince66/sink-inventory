import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyWallet } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchLoyaltyProgressParams = {
  loyaltyCode: string;
  /**
   * Set on the customer-facing pages, where the caller has no session. It stops
   * the proxy forwarding whatever accessToken cookie happens to be in the
   * browser — a stale one is rejected while the API authenticates, even though
   * the endpoint itself is public.
   */
  isPublic?: boolean;
};

export const fetchLoyaltyProgress = async ({
  loyaltyCode,
  isPublic,
}: FetchLoyaltyProgressParams) => {
  const url = new URL(
    `/api/loyalty/progress/${loyaltyCode}`,
    window.location.origin
  );
  if (isPublic) url.searchParams.set("public", "1");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching loyalty progress"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<LoyaltyWallet>>;
};

type QueryFnType = typeof fetchLoyaltyProgress;

type UseFetchLoyaltyProgress = QueryConfigType<QueryFnType> & {
  params: FetchLoyaltyProgressParams;
};

export const useFetchLoyaltyProgressQuery = ({
  params,
  ...config
}: UseFetchLoyaltyProgress) => {
  const { mutate: logout } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      // Never on the public pages: the caller is a customer with no session, so
      // a 401 there must not bounce them to /login off their own loyalty card.
      if (error.status === 401 && !params.isPublic) {
        logout();
      }
      return failureCount < 2;
    },
    queryKey: [
      queryKey.loyalty.getLoyaltyProgress,
      params.loyaltyCode,
      params.isPublic ?? false,
    ],
    queryFn: () => fetchLoyaltyProgress(params),
    enabled: Boolean(params.loyaltyCode),
    ...config,
  });
};
