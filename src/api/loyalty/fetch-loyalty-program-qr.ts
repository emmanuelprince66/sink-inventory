import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyProgramQRDetails } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchLoyaltyProgramQrParams = {
  programId: string;
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchLoyaltyProgramQr = async ({
  programId,
  search,
  page,
  limit,
}: FetchLoyaltyProgramQrParams) => {
  const url = new URL(
    `/api/loyalty/programs/${programId}/qr`,
    window.location.origin
  );

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page !== undefined) params.append("page", String(page));
  if (limit !== undefined) params.append("limit", String(limit));
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
      errorData.message || "Error fetching loyalty program QR"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<LoyaltyProgramQRDetails>>;
};

type QueryFnType = typeof fetchLoyaltyProgramQr;

type UseFetchLoyaltyProgramQr = QueryConfigType<QueryFnType> & {
  params: FetchLoyaltyProgramQrParams;
};

export const useFetchLoyaltyProgramQrQuery = ({
  params,
  ...config
}: UseFetchLoyaltyProgramQr) => {
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
      queryKey.loyalty.getProgramQr,
      params.programId,
      params.search,
      params.page,
      params.limit,
    ],
    queryFn: () => fetchLoyaltyProgramQr(params),
    enabled: Boolean(params.programId),
    ...config,
  });
};
