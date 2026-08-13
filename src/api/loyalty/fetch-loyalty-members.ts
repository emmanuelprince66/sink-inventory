import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { LoyaltyMember } from "@/types/loyalty";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchLoyaltyMembersParams = {
  id: string;

};

export const fetchLoyaltyMembers = async ({ id }: FetchLoyaltyMembersParams) => {
  const url = new URL(
    `/api/loyalty/${id}/members`,
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
      errorData.message || "Error fetching loyalty members"
    );
    (error as any).type = response.type;
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<LoyaltyMember>>;
};

type QueryFnType = typeof fetchLoyaltyMembers;

type UseFetchLoyaltyMembers = QueryConfigType<QueryFnType> & {
  params: FetchLoyaltyMembersParams;
};

export const useFetchLoyaltyMembersQuery = ({
  params,
  ...config
}: UseFetchLoyaltyMembers) => {
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
      queryKey.loyalty.getLoyaltyMembers,
      params.id,
    ],
    queryFn: () => fetchLoyaltyMembers(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
