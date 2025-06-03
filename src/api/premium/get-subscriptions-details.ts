import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type FetchPremiumProps = {
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchPremium = async ({
  search = "",
  page = 1,
  limit = 15,
}: FetchPremiumProps) => {
  const url = new URL(`/api/premium/details`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching details data");
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchPremium;

type useGetPremiumData = QueryConfigType<QueryFnType> & {
  params: FetchPremiumProps;
};

export const useGetPremiumQuery = ({
  params,
  ...config
}: useGetPremiumData) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      return failureCount < 2;
    },
    // Include all parameters in the query key
    queryKey: [
      queryKey.premium.getPremiumDetails,
      params.search,
      params.page,
      params.limit,
      params.page,
    ],
    queryFn: () => fetchPremium(params),
    ...config,
  });
};
