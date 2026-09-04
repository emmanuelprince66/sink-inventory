import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse, Paginated } from "@/types/api";

/**
 * The six usage_type values, from the spec. CREDIT_TOPUP is the only one that
 * adds credit rather than spending it.
 */
export type CampaignUsageType =
  | "CAMPAIGN_BROADCAST"
  | "MARKET_AUTOMATION"
  | "POST_SALE_RECEIPT"
  | "LOYALTY_ALERT"
  | "BIRTHDAY_WISH"
  | "CREDIT_TOPUP";

/**
 * One row of the campaign credit ledger — GET /campaign/credit-usage/{id}/.
 *
 * A charge, and now also what that charge bought: the channel it went out on
 * and who it reached. `channel_display` and `recipient` are the pre-formatted
 * pair to render — the serializer fills them for every row, including the
 * top-ups that have no channel of their own ("Top-Up" / "N/A (Wallet)"), so
 * neither column has to invent a fallback for a null.
 */
export interface CampaignCreditUsageLog {
  id: string;
  /** Widened to string: an unrecognised value should render, not break. */
  usage_type: CampaignUsageType | string;
  usage_type_display?: string;
  title: string;
  units_used: number;
  /** Credit balance immediately after this charge. */
  balance_after?: number;
  /** Raw channel; prefer `channel_display`, which is filled for every row. */
  channel?: string | null;
  channel_display?: string | null;
  /** Ready to print — "142 recipients", an address, or "N/A (Wallet)". */
  recipient?: string | null;
  recipients_count?: number | null;
  message_body?: string | null;
  created_at?: string;
}

/**
 * Totals across every page, not just the one fetched.
 *
 * `total` is the paginator's count of ledger rows — charges, not messages. One
 * broadcast charge can carry 142 messages, so the two are different numbers
 * and reading `total` as a message count understates sending by whatever the
 * average audience size is.
 */
export interface CampaignCreditUsageStats {
  total_messages_sent?: number;
  sms_messages_sent?: number;
  email_messages_sent?: number;
  total_credits_used?: string;
  current_balance?: string;
}

export type CampaignCreditUsagePage = Paginated<CampaignCreditUsageLog> & {
  stats?: CampaignCreditUsageStats;
  total_messages_sent?: number;
};

export interface CampaignCreditUsageFilters {
  channel?: string;
  usage_type?: string;
}

export const fetchCampaignCreditUsage = async (
  id: string,
  filters: CampaignCreditUsageFilters = {},
) => {
  const search = new URLSearchParams();
  // "ALL" is the tab's own default and means no filter, so it is dropped
  // rather than sent as a channel the backend would have to special-case.
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "ALL") search.append(key, value);
  });

  const query = search.toString();
  const response = await fetch(
    `/api/campaign/${id}/credit-usage${query ? `?${query}` : ""}`,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching campaign credit usage",
    );
    (error as any).status = response.status;
    throw error;
  }

  return response.json() as Promise<ApiResponse<CampaignCreditUsagePage>>;
};

type QueryFnType = typeof fetchCampaignCreditUsage;

export const useFetchCampaignCreditUsageQuery = (
  id: string,
  filters: CampaignCreditUsageFilters = {},
  config?: QueryConfigType<QueryFnType>,
) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    // A business with no campaign credit yet 404s; retrying that just delays
    // the empty state.
    retry: (failureCount, error: any) =>
      [401, 404].includes(error?.status) ? false : failureCount < 1,
    queryKey: [
      queryKey.campaign.getCreditUsage,
      id,
      filters.channel ?? "",
      filters.usage_type ?? "",
    ],
    queryFn: () => fetchCampaignCreditUsage(id, filters),
    enabled: Boolean(id),
    ...config,
  });

/**
 * Messages sent, from wherever this deployment puts it.
 *
 * Offered at two levels — `stats.total_messages_sent` and a top-level
 * duplicate — so both are read before giving up. Undefined rather than 0 when
 * absent: an older backend that sends neither should leave the tile blank, not
 * claim nothing was ever sent.
 */
export const messagesSentFrom = (
  page?: CampaignCreditUsagePage,
): number | undefined =>
  page?.stats?.total_messages_sent ?? page?.total_messages_sent;
