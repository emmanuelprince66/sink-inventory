import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { UserCustomer } from "@/types/segment";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchSegmentCustomersParams = {
  segmentId: string;
};

export const fetchSegmentCustomers = async ({
  segmentId,
}: FetchSegmentCustomersParams) => {
  const url = new URL(
    `/api/customer/segment/customers/${segmentId}`,
    window.location.origin
  );

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching segment customers"
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<UserCustomer[]>>;
};

type QueryFnType = typeof fetchSegmentCustomers;

type UseFetchSegmentCustomers = QueryConfigType<QueryFnType> & {
  params: FetchSegmentCustomersParams;
};

export const useFetchSegmentCustomersQuery = ({
  params,
  ...config
}: UseFetchSegmentCustomers) => {
  const { mutate: logout } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if (error.status === 401) {
        logout();
      }
      return failureCount < 2;
    },
    queryKey: [queryKey.segment.getSegmentCustomers, params.segmentId],
    queryFn: () => fetchSegmentCustomers(params),
    enabled: Boolean(params.segmentId),
    ...config,
  });
};
