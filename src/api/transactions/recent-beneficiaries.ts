import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

/**
 * The accounts this wallet has paid before.
 *
 * One row per account, newest transfer first. Picking one fills the bank and
 * the account number so a weekly supplier does not have to be typed out again.
 *
 * It does NOT carry a transfer `ref`, and `ref` is what /wallet/transfer/
 * requires — so a pick still runs the beneficiary enquiry, exactly as a typed
 * number does. That round trip is worth keeping anyway: it re-confirms the
 * name against the bank, which is the one check standing between a saved row
 * and money going to an account that has since changed hands.
 */

export interface RecentBeneficiary {
  account_name: string;
  account_number: string;
  bank_name: string;
  /** Nullable — an older row may predate the code being recorded. */
  bank_code: string | null;
  bank_logo: string | null;
  /** Pre-computed, e.g. "JD". */
  initials: string;
  last_transfer_amount: number;
  last_transfer_at: string;
}

interface RecentBeneficiariesResponse {
  status: string;
  count: number;
  results: RecentBeneficiary[];
}

export type FetchRecentBeneficiariesParams = {
  /** Wallet id. The endpoint also accepts a business id. */
  walletId: string;
  /** Default 10, max 50 upstream. */
  limit?: number;
  search?: string;
};

/**
 * Unwraps the two envelopes between caller and payload: the route handler's
 * `{ success, data }` around the API's own `{ status, count, results }`.
 * Read defensively — a beneficiary shortcut is not worth a crash.
 */
const unwrap = (payload: any): RecentBeneficiary[] => {
  const body = payload?.data ?? payload;
  const results = body?.results ?? body?.data?.results;
  return Array.isArray(results) ? results : [];
};

export const fetchRecentBeneficiaries = async ({
  walletId,
  ...query
}: FetchRecentBeneficiariesParams): Promise<RecentBeneficiary[]> => {
  const url = new URL(
    `/api/transactions/${walletId}/recent-beneficiaries`,
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

type QueryFnType = typeof fetchRecentBeneficiaries;

export const useFetchRecentBeneficiariesQuery = ({
  params,
  ...config
}: QueryConfigType<QueryFnType> & {
  params: FetchRecentBeneficiariesParams;
}) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.transactions.recentBeneficiaries, params],
    queryFn: () => fetchRecentBeneficiaries(params),
    enabled: Boolean(params.walletId),
    ...config,
  });
