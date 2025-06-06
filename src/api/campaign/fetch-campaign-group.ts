import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export const FetchCampaignGroup = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/campaign/${id}/group`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof FetchCampaignGroup;

type options = QueryConfigType<QueryFnType>;

export const useFetchCampaignGroupQuery = (id: any, config?: options) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.campaign.getGroups, id],
    queryFn: () => FetchCampaignGroup(id),
    staleTime: 1000 * 60 * 5,
    ...config,
  });
};
