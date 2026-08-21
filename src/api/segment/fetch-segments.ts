import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { CustomerSegment } from "@/types/segment";
import { useLogoutMutation } from "../auth/logout-user";

export type FetchSegmentsParams = {
  id: string;
};

export const fetchSegments = async ({ id }: FetchSegmentsParams) => {
  const url = new URL(`/api/customer/segment/${id}`, window.location.origin);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching customer segments"
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json() as Promise<ApiResponse<CustomerSegment[]>>;
};

type QueryFnType = typeof fetchSegments;

type UseFetchSegments = QueryConfigType<QueryFnType> & {
  params: FetchSegmentsParams;
};

export const useFetchSegmentsQuery = ({
  params,
  ...config
}: UseFetchSegments) => {
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
    queryKey: [queryKey.segment.getSegments, params.id],
    queryFn: () => fetchSegments(params),
    enabled: Boolean(params.id),
    ...config,
  });
};
