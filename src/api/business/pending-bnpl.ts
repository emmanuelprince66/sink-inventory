import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

/**
 * BNPL sales waiting on Akawopay to settle.
 *
 * The customer has already taken the goods — the order was approved at
 * checkout — but the payout runs on Akawopay's own cycle, so this is money the
 * merchant is owed rather than money they hold. Nothing here is in the wallet
 * balance yet, which is why it is reported apart from the transaction list.
 */

/** Where a payout sits. Rows carry the canonical uppercase form. */
export type BnplSettlementStage =
  | "AWAITING_SETTLEMENT"
  | "PROCESSING_PAYOUT"
  | "FAILED_RETRYING"
  | "SETTLED";

/**
 * The `stage` filter. Case-insensitive upstream, but sent lowercase to match
 * the documented form. "all" is the only way to see settled payouts alongside
 * the pending ones — omitting the parameter returns outstanding orders only.
 */
export type BnplStageFilter =
  | "all"
  | "awaiting_settlement"
  | "processing_payout"
  | "failed_retrying"
  | "settled";

export interface PendingBnplCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface PendingBnplOrder {
  sale_id: string;
  order_reference: string;
  channel: string;
  /** Null on a walk-in that was never tied to a customer record. */
  customer: PendingBnplCustomer | null;
  /** Decimal string — what the customer was charged. */
  order_amount: string;
  /** Pre-formatted, e.g. "3.00%". */
  fee_rate: string;
  fee_deducted: number;
  /** What actually lands in the wallet: order_amount minus the fee. */
  net_settlement_amount: number;
  order_date: string;
  settlement_stage: BnplSettlementStage | string;
  stage_label: string;
  stage_description: string;
  akawopay_charge_id: string | null;
  /** Set once the payout has a wallet transaction behind it. */
  wallet_transaction_id: string | null;
  /** When the money actually landed. Null until the stage is SETTLED. */
  settled_at?: string | null;
}

interface StageBreakdown {
  count: number;
  gross_amount: number;
  /**
   * Uniform across every stage. `estimated_net` and `settled_net` are the
   * older per-stage names the API still sends; read this one.
   */
  net_amount?: number;
  estimated_net?: number;
  settled_net?: number;
}

export interface PendingBnplSummary {
  /** Outstanding — money the merchant is owed. */
  total_pending_gross: number;
  total_estimated_net: number;
  total_estimated_fees: number;
  total_pending_orders: number;
  /** Already paid out, across the date range asked for. */
  total_settled_gross?: number;
  total_settled_net?: number;
  total_settled_fees?: number;
  total_settled_orders?: number;
  /**
   * Counted over the whole date range rather than the current filter, so the
   * tab badges keep their numbers when one of them is selected.
   */
  breakdown: Partial<Record<BnplStageFilter, StageBreakdown>>;
}

export interface PendingBnpl {
  links: { next: string | null; previous: string | null };
  total: number;
  limit: number;
  pages: number;
  summary: PendingBnplSummary;
  results: PendingBnplOrder[];
}

export type FetchPendingBnplParams = {
  businessId: string;
  stage?: BnplStageFilter;
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
};

/**
 * Unwraps the two envelopes between the caller and the payload.
 *
 * The route handler answers `{ success, data }` around the API's own
 * `{ success, data, message }`, so the figures sit two levels down. Read
 * defensively rather than reaching straight for `.data.data`: a summary card
 * is not worth a crash if either envelope is dropped.
 */
const unwrap = (payload: any): PendingBnpl | null =>
  payload?.data?.data ?? payload?.data ?? null;

export const fetchPendingBnpl = async ({
  businessId,
  ...query
}: FetchPendingBnplParams): Promise<PendingBnpl | null> => {
  const url = new URL(
    `/api/businesses/${businessId}/pending-bnpl`,
    window.location.origin,
  );
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;

  return unwrap(payload);
};

type QueryFnType = typeof fetchPendingBnpl;

export const useFetchPendingBnplQuery = ({
  params,
  ...config
}: QueryConfigType<QueryFnType> & { params: FetchPendingBnplParams }) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.business.getPendingBnpl, params],
    queryFn: () => fetchPendingBnpl(params),
    enabled: Boolean(params.businessId),
    ...config,
  });
