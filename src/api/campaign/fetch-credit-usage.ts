import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse, Paginated } from "@/types/api";

/**
 * One row of the campaign credit ledger — GET /campaign/credit-usage/{id}/.
 *
 * This is a record of credit being spent, not of a message being delivered:
 * there is no recipient and no message body on it, which is why the Usage tab
 * shows what was charged rather than who received what.
 */
export interface CampaignCreditUsageLog {
  id: string;
  /** Enum of six; the human form comes back as usage_type_display. */
  usage_type: string;
  usage_type_display?: string;
  title: string;
  units_used: number;
  /** Credit balance immediately after this charge. */
  balance_after?: number;
  created_at?: string;
}

export const fetchCampaignCreditUsage = async (id: string) => {
  const response = await fetch(`/api/campaign/${id}/credit-usage`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching campaign credit usage",
    );
    (error as any).status = response.status;
    throw error;
  }

  return response.json() as Promise<
    ApiResponse<Paginated<CampaignCreditUsageLog>>
  >;
};

type QueryFnType = typeof fetchCampaignCreditUsage;

export const useFetchCampaignCreditUsageQuery = (
  id: string,
  config?: QueryConfigType<QueryFnType>,
) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    // A business with no campaign credit yet 404s; retrying that just delays
    // the empty state.
    retry: (failureCount, error: any) =>
      [401, 404].includes(error?.status) ? false : failureCount < 1,
    queryKey: [queryKey.campaign.getCreditUsage, id],
    queryFn: () => fetchCampaignCreditUsage(id),
    enabled: Boolean(id),
    ...config,
  });
