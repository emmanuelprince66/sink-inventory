import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse } from "@/types/api";
import { PublicLoyaltyProgram } from "@/types/loyalty";

// GET /loyalty/join/{token}/ — public campaign details behind a QR code.
// No auth: the caller is a customer who has just scanned, with no session.
export type FetchPublicCampaignParams = {
  token: string;
};

export const fetchPublicCampaign = async ({
  token,
}: FetchPublicCampaignParams) => {
  const url = new URL(`/api/loyalty/join/${token}`, window.location.origin);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Could not load this campaign",
    );
    (error as any).status = response.status;
    throw error;
  }

  return response.json() as Promise<ApiResponse<PublicLoyaltyProgram>>;
};

type QueryFnType = typeof fetchPublicCampaign;

type UseFetchPublicCampaign = QueryConfigType<QueryFnType> & {
  params: FetchPublicCampaignParams;
};

export const useFetchPublicCampaignQuery = ({
  params,
  ...config
}: UseFetchPublicCampaign) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    // 404 means an invalid or expired QR and 400 means the programme is not
    // active — retrying either just delays the message to the customer.
    retry: (failureCount, error: any) =>
      [400, 404].includes(error?.status) ? false : failureCount < 2,
    queryKey: [queryKey.loyalty.getPublicCampaign, params.token],
    queryFn: () => fetchPublicCampaign(params),
    enabled: Boolean(params.token),
    ...config,
  });
