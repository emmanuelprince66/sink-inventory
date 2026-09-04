import { useQuery } from "@tanstack/react-query";

export interface CampaignEstimateRequest {
  channel: "SMS" | "EMAIL";
  send_to_all?: boolean;
  customer_ids?: string[];
  group_ids?: string[];
  segment_ids?: string[];
}

/**
 * Decimal strings throughout, because credits are no longer whole numbers —
 * an email costs 0.30 — and rounding them into integers on the way in is how
 * a balance ends up disagreeing with what was charged.
 */
export interface CampaignEstimate {
  channel: string;
  total_unique_customers: number;
  /** Those who actually have an email, or a valid phone, for this channel. */
  reachable_recipients: number;
  /** Selected but uncontactable — the gap the composer has to explain. */
  unreachable_count: number;
  unit_cost: string;
  credits_required: string;
  current_balance: string;
  balance_after: string;
  sufficient_credit: boolean;
}

const estimateCampaign = async ({
  businessId,
  body,
}: {
  businessId: string;
  body: CampaignEstimateRequest;
}) => {
  const response = await fetch(`/api/campaign/${businessId}/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw payload ?? { error: "Estimate failed" };
  return payload;
};

/** True once there is anyone to count — an empty selection costs nothing. */
export const hasAudience = (body: CampaignEstimateRequest): boolean =>
  Boolean(
    body.send_to_all ||
      body.customer_ids?.length ||
      body.group_ids?.length ||
      body.segment_ids?.length,
  );

/**
 * Runs on every audience change, which is why it is a query rather than a
 * mutation: react-query dedupes identical selections, so toggling a group off
 * and back on does not re-ask, and a stale answer is never shown against a
 * newer selection.
 */
export const useCampaignEstimateQuery = (
  businessId: string | null,
  body: CampaignEstimateRequest,
) =>
  useQuery({
    queryKey: [
      "campaign-estimate",
      businessId,
      body.channel,
      body.send_to_all,
      // Sorted so the same set picked in a different order is one cache entry.
      [...(body.customer_ids ?? [])].sort().join(","),
      [...(body.group_ids ?? [])].sort().join(","),
      [...(body.segment_ids ?? [])].sort().join(","),
    ],
    queryFn: () => estimateCampaign({ businessId: businessId!, body }),
    enabled: Boolean(businessId) && hasAudience(body),
    // The audience is a moving target while someone is picking; a short window
    // keeps the panel honest without a request per keystroke.
    staleTime: 1000 * 15,
    retry: false,
  });

/** The estimate off the proxy envelope, whichever way it is wrapped. */
export const estimateFrom = (data: any): CampaignEstimate | undefined =>
  data?.data ?? data;
