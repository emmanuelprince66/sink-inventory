import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyProgramDetail } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchLoyaltyProgramDetailParams = {
  programId: string;

};

export const fetchLoyaltyProgramDetail = async ({ programId }: FetchLoyaltyProgramDetailParams) => {
  const url = new URL(
    `/api/loyalty/programs/${programId}`,
    window.location.origin
  );

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching loyalty program detail"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<LoyaltyProgramDetail>>;
};

type QueryFnType = typeof fetchLoyaltyProgramDetail;

type UseFetchLoyaltyProgramDetail = QueryConfigType<QueryFnType> & {
  params: FetchLoyaltyProgramDetailParams;
};

export const useFetchLoyaltyProgramDetailQuery = ({
  params,
  ...config
}: UseFetchLoyaltyProgramDetail) => {
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
      queryKey.loyalty.getLoyaltyProgramDetail,
      params.programId,
    ],
    queryFn: () => fetchLoyaltyProgramDetail(params),
    enabled: Boolean(params.programId),
    ...config,
  });
};
