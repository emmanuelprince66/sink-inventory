import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export type FetchRecentActivityParams = {
  id: string;
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchRecentActivity = async ({
  id,
  ...query
}: FetchRecentActivityParams) => {
  const url = new URL(
    `/api/expenses/${id}/recent-activity`,
    window.location.origin,
  );
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error fetching recent activity");
  }

  return response.json();
};

type QueryFnType = typeof fetchRecentActivity;

type UseFetchRecentActivityOptions = QueryConfigType<QueryFnType> & {
  params: FetchRecentActivityParams;
};

export const useFetchRecentActivityQuery = ({
  params,
  ...config
}: UseFetchRecentActivityOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.expenses.getRecentActivity, params],
    queryFn: () => fetchRecentActivity(params),
    ...config,
  });
};
