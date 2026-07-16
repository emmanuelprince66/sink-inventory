import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export type FetchSpendByUserParams = {
  id: string;
  search?: string;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
};

export const fetchSpendByUser = async ({
  id,
  ...query
}: FetchSpendByUserParams) => {
  const url = new URL(
    `/api/expenses/${id}/spend-by-user`,
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
    throw new Error(errorData.message || "Error fetching spend by user");
  }

  return response.json();
};

type QueryFnType = typeof fetchSpendByUser;

type UseFetchSpendByUserOptions = QueryConfigType<QueryFnType> & {
  params: FetchSpendByUserParams;
};

export const useFetchSpendByUserQuery = ({
  params,
  ...config
}: UseFetchSpendByUserOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.expenses.getSpendByUser, params],
    queryFn: () => fetchSpendByUser(params),
    ...config,
  });
};
